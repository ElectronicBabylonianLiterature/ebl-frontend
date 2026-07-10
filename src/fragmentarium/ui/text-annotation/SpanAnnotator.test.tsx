import React from 'react'
import SpanAnnotator, {
  clearSelection,
} from 'fragmentarium/ui/text-annotation/SpanAnnotator'
import AnnotationContext from 'fragmentarium/ui/text-annotation/TextAnnotationContext'
import { AnnotationSpan } from 'fragmentarium/ui/text-annotation/annotationSpan'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { realiaEntryFactory } from 'test-support/realia-fixtures'
import {
  mockRealiaSearch,
  WithRealiaService,
} from 'fragmentarium/ui/text-annotation/textAnnotation.testSupport'

jest.mock('realia/application/RealiaService')

let container: HTMLElement
const selection = ['Word-1', 'Word-2']
const setSelection = jest.fn()
const testCategory = 'PN: Personal Name'
const mockDispatch = jest.fn()

const realiaEntry = realiaEntryFactory.build({
  id: 'Apkallu',
  realiaId: 'realia_000846',
})

describe('SpanAnnotator', () => {
  const setup = (annotations: readonly AnnotationSpan[] = []): void => {
    jest.clearAllMocks()
    mockRealiaSearch([realiaEntry])
    container = render(
      <WithRealiaService>
        <AnnotationContext.Provider
          value={[{ annotations, words: [] }, mockDispatch]}
        >
          <SpanAnnotator selection={selection} setSelection={setSelection} />
        </AnnotationContext.Provider>
      </WithRealiaService>,
    ).container
  }

  it('shows the selection menu', () => {
    setup()
    expect(container).toMatchSnapshot()
  })

  it('shows the options', async () => {
    setup()
    const input = screen.getByLabelText('annotate-named-entities')
    await userEvent.click(input)
    expect(screen.getByText(testCategory)).toBeInTheDocument()
  })

  it('sets the option on click', async () => {
    setup()
    const input = screen.getByLabelText('annotate-named-entities')
    await userEvent.click(input)
    await userEvent.click(screen.getByText(testCategory))
    expect(setSelection).toHaveBeenCalledWith([])
  })

  it('dispatches add action when option is selected', async () => {
    setup()
    const input = screen.getByLabelText('annotate-named-entities')
    await userEvent.click(input)
    await userEvent.click(screen.getByText(testCategory))

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'add',
      annotation: {
        id: 'Entity-1',
        type: 'PERSONAL_NAME',
        span: selection,
      },
    })
  })

  it('dispatches add action with the realiaId when a realia entry is selected', async () => {
    setup()
    const input = screen.getByLabelText('annotate-realia')
    await userEvent.type(input, 'Apk')
    await userEvent.click(await screen.findByText('Apkallu'))

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'add',
      annotation: {
        id: 'Realia-1',
        realiaId: 'realia_000846',
        span: selection,
      },
    })
    expect(setSelection).toHaveBeenCalledWith([])
  })

  it('numbers realia ids independently of entity ids', async () => {
    setup([
      {
        id: 'Entity-7',
        type: 'PERSONAL_NAME',
        span: ['Word-1'],
        tier: 1,
        name: 'Personal Name',
      },
    ])
    const input = screen.getByLabelText('annotate-realia')
    await userEvent.type(input, 'Apk')
    await userEvent.click(await screen.findByText('Apkallu'))

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        annotation: expect.objectContaining({ id: 'Realia-1' }),
      }),
    )
  })
})

describe('clearSelection', () => {
  const originalGetSelection = window.getSelection

  afterEach(() => {
    window.getSelection = originalGetSelection
  })

  const mockSelection = (selection: Partial<Selection>): void => {
    window.getSelection = jest.fn(() => selection as Selection)
  }

  it('empties the selection when the browser supports it', () => {
    const empty = jest.fn()
    mockSelection({ empty })

    clearSelection()

    expect(empty).toHaveBeenCalled()
  })

  it('removes all ranges when empty is unavailable', () => {
    const removeAllRanges = jest.fn()
    mockSelection({ removeAllRanges })

    clearSelection()

    expect(removeAllRanges).toHaveBeenCalled()
  })

  it('does nothing when neither method is available', () => {
    mockSelection({})

    expect(() => clearSelection()).not.toThrow()
  })

  it('does nothing when the browser has no selection API', () => {
    Object.defineProperty(window, 'getSelection', {
      value: undefined,
      writable: true,
      configurable: true,
    })

    expect(() => clearSelection()).not.toThrow()
  })
})
