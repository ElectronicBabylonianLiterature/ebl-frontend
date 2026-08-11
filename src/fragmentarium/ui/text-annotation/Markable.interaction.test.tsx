import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Markable from 'fragmentarium/ui/text-annotation/Markable'
import { atfTokenKur } from 'test-support/test-tokens'
import DisplayToken from 'transliteration/ui/DisplayToken'
import AnnotationContext, {
  AnnotationContextService,
} from 'fragmentarium/ui/text-annotation/TextAnnotationContext'
import {
  EntityAnnotationSpan,
  RealiaAnnotationSpan,
} from 'fragmentarium/ui/text-annotation/annotationSpan'
import { AnyWord } from 'transliteration/domain/token'
import { getSelectedTokens } from 'fragmentarium/ui/text-annotation/selectionUtils'
import {
  entityAnnotationSpan,
  realiaAnnotationSpan,
  WithRealiaService,
} from 'fragmentarium/ui/text-annotation/textAnnotation.testSupport'

jest.mock('realia/application/RealiaService')
jest.mock('fragmentarium/ui/text-annotation/selectionUtils', () => ({
  ...jest.requireActual('fragmentarium/ui/text-annotation/selectionUtils'),
  getSelectedTokens: jest.fn(),
}))
jest.mock('fragmentarium/ui/text-annotation/InlineEditor', () => ({
  __esModule: true,
  default: ({
    show,
    onHide,
    onEntered,
    title,
    children,
  }: {
    show: boolean
    onHide: () => void
    onEntered: () => void
    title: string
    children: React.ReactNode
  }) =>
    show ? (
      <div>
        {children}
        <button aria-label={`entered:${title}`} onClick={onEntered} />
        <button aria-label={`hide:${title}`} onClick={onHide} />
      </div>
    ) : null,
}))

const word = { ...atfTokenKur, id: 'Word-1' }
const getSelectedTokensMock = getSelectedTokens as jest.MockedFunction<
  typeof getSelectedTokens
>

function renderMarkable({
  token = word,
  selection = [],
  activeSpanId = null,
  setSelection = jest.fn(),
  setActiveSpanId = jest.fn(),
  selectionStartTokenIdRef,
  namedEntities = [],
  realia = [],
  words = ['Word-1', 'Word-2'],
}: {
  token?: AnyWord
  selection?: readonly string[]
  activeSpanId?: string | null
  setSelection?: jest.Mock
  setActiveSpanId?: jest.Mock
  selectionStartTokenIdRef?: React.MutableRefObject<string | null>
  namedEntities?: readonly EntityAnnotationSpan[]
  realia?: readonly RealiaAnnotationSpan[]
  words?: readonly string[]
}): void {
  const context: AnnotationContextService = [
    { namedEntities, realia, words },
    jest.fn(),
  ]
  render(
    <WithRealiaService>
      <AnnotationContext.Provider value={context}>
        <Markable
          token={token}
          selection={selection}
          setSelection={setSelection}
          activeSpanId={activeSpanId}
          setActiveSpanId={setActiveSpanId}
          selectionStartTokenIdRef={selectionStartTokenIdRef}
        >
          <DisplayToken token={word} />
        </Markable>
      </AnnotationContext.Provider>
    </WithRealiaService>,
  )
}

afterEach(() => getSelectedTokensMock.mockReset())

describe('Markable interactions', () => {
  it('merges the selection on alt-click', () => {
    const setSelection = jest.fn()
    getSelectedTokensMock.mockReturnValue(['Word-1'])
    renderMarkable({ selection: ['Word-2'], setSelection })

    fireEvent.mouseUp(screen.getByText('kur'), { altKey: true })

    const updater = setSelection.mock.calls[0][0]
    expect(updater(['Word-2'])).toEqual(['Word-1', 'Word-2'])
  })

  it('deselects on alt-click when the token is already selected', () => {
    const setSelection = jest.fn()
    getSelectedTokensMock.mockReturnValue(['Word-1'])
    renderMarkable({ selection: ['Word-1', 'Word-2'], setSelection })

    fireEvent.mouseUp(screen.getByText('kur'), { altKey: true })

    const updater = setSelection.mock.calls[0][0]
    expect(updater(['Word-1', 'Word-2'])).toEqual(['Word-2'])
  })

  it('pluralises the annotator title for a multi-token selection', async () => {
    const setSelection = jest.fn()
    renderMarkable({ selection: ['Word-1', 'Word-2'], setSelection })

    await userEvent.click(screen.getByLabelText('hide:Annotate 2 Words'))

    expect(setSelection).toHaveBeenCalledWith([])
  })

  it('clears the pending start token after handling a local selection', () => {
    const selectionStartTokenIdRef = { current: 'Word-1' as string | null }
    getSelectedTokensMock.mockReturnValue(['Word-1'])
    renderMarkable({ selectionStartTokenIdRef })

    fireEvent.mouseUp(screen.getByText('kur'))

    expect(selectionStartTokenIdRef.current).toBeNull()
  })

  it('clears the selection when the annotator popover hides', async () => {
    const setSelection = jest.fn()
    renderMarkable({ selection: ['Word-1'], setSelection })

    await userEvent.click(screen.getByLabelText('hide:Annotate 1 Word'))

    expect(setSelection).toHaveBeenCalledWith([])
  })

  it('closes the active span when the editor popover hides or enters', async () => {
    const setActiveSpanId = jest.fn()
    const span = entityAnnotationSpan({
      id: 'Entity-1',
      type: 'PERSONAL_NAME',
      span: ['Word-1'],
    })
    renderMarkable({
      activeSpanId: 'Entity-1',
      namedEntities: [span],
      setActiveSpanId,
    })

    await userEvent.click(screen.getByLabelText('entered:Edit Personal Name'))
    await userEvent.click(screen.getByLabelText('hide:Edit Personal Name'))

    expect(setActiveSpanId).toHaveBeenCalledWith(null)
  })

  it('resolves an active realia span for the editor', async () => {
    const setActiveSpanId = jest.fn()
    const span = realiaAnnotationSpan({
      id: 'Realia-1',
      realiaId: 'realia_000846',
      span: ['Word-1'],
    })
    renderMarkable({
      activeSpanId: 'Realia-1',
      realia: [span],
      setActiveSpanId,
    })

    await userEvent.click(screen.getByLabelText('hide:Edit realia_000846'))

    expect(setActiveSpanId).toHaveBeenCalledWith(null)
  })

  it('records the start token on mouse down', () => {
    const selectionStartTokenIdRef = { current: null as string | null }
    renderMarkable({ selectionStartTokenIdRef })

    fireEvent.mouseDown(screen.getByRole('button'))

    expect(selectionStartTokenIdRef.current).toBe('Word-1')
  })

  it('records a null start token on mouse down for a token without an id', () => {
    const selectionStartTokenIdRef = { current: 'Word-9' as string | null }
    renderMarkable({
      token: { ...atfTokenKur, id: null },
      selectionStartTokenIdRef,
    })

    fireEvent.mouseDown(screen.getByRole('button'))

    expect(selectionStartTokenIdRef.current).toBeNull()
  })
})
