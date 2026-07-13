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
  entityAnnotationSpan,
  mockRealiaSearch,
  realiaAnnotationSpan,
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
  type: ['Divine names'],
})
const unmappedRealiaEntry = realiaEntryFactory.build({
  id: 'Ziggurat',
  realiaId: 'realia_000999',
  type: ['Literature'],
})

const existingTag: AnnotationSpan = entityAnnotationSpan({
  id: 'Entity-3',
  type: 'ROYAL_NAME',
  span: selection,
})

const selectRealia = async (label = 'Apkallu'): Promise<void> => {
  await userEvent.type(
    screen.getByLabelText('annotate-realia'),
    label.slice(0, 3),
  )
  await userEvent.click(await screen.findByText(label))
}

describe('SpanAnnotator', () => {
  const setup = (
    annotations: readonly AnnotationSpan[] = [],
    entries = [realiaEntry],
  ): void => {
    jest.clearAllMocks()
    mockRealiaSearch(entries)
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
        layer: 'namedEntities',
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
        layer: 'realia',
      },
    })
    expect(setSelection).toHaveBeenCalledWith([])
  })

  it('numbers realia ids independently of entity ids', async () => {
    setup([
      entityAnnotationSpan({
        id: 'Entity-7',
        type: 'PERSONAL_NAME',
        span: ['Word-1'],
      }),
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

  describe('automatic tagging from the realia classification', () => {
    it('adds the mapped tag when the span has no tag', async () => {
      setup()
      await selectRealia()

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'add',
        annotation: {
          id: 'Entity-1',
          type: 'DIVINE_NAME',
          span: selection,
          layer: 'namedEntities',
        },
      })
      expect(mockDispatch).toHaveBeenCalledTimes(2)
    })

    it('does not add a tag when the span already has one', async () => {
      setup([existingTag])
      await selectRealia()

      expect(mockDispatch).toHaveBeenCalledTimes(1)
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          annotation: expect.objectContaining({ realiaId: 'realia_000846' }),
        }),
      )
    })

    it('adds a tag when the existing tag covers a different span', async () => {
      setup([{ ...existingTag, span: ['Word-9'] }])
      await selectRealia()

      expect(mockDispatch).toHaveBeenCalledTimes(2)
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          annotation: expect.objectContaining({ type: 'DIVINE_NAME' }),
        }),
      )
    })

    it('does not add a tag when the classification is not mapped', async () => {
      setup([], [unmappedRealiaEntry])
      await selectRealia('Ziggurat')

      expect(mockDispatch).toHaveBeenCalledTimes(1)
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          annotation: expect.objectContaining({ realiaId: 'realia_000999' }),
        }),
      )
    })

    it('adds nothing when the tag selection is cleared', async () => {
      setup()
      const input = screen.getByLabelText('annotate-named-entities')
      await userEvent.click(input)
      await userEvent.click(screen.getByText(testCategory))
      mockDispatch.mockClear()

      await userEvent.type(input, '{backspace}')

      expect(mockDispatch).not.toHaveBeenCalled()
    })

    it('adds nothing when the realia selection is cleared', async () => {
      setup()
      await userEvent.type(
        screen.getByLabelText('annotate-realia'),
        '{backspace}',
      )

      expect(mockDispatch).not.toHaveBeenCalled()
    })
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

describe('SpanAnnotator uniqueness', () => {
  const existingRealia: AnnotationSpan = realiaAnnotationSpan({
    id: 'Realia-1',
    realiaId: 'realia_000846',
    span: selection,
  })

  const setupWith = (annotations: readonly AnnotationSpan[]): void => {
    jest.clearAllMocks()
    mockRealiaSearch([realiaEntry])
    render(
      <WithRealiaService>
        <AnnotationContext.Provider
          value={[{ annotations, words: [] }, mockDispatch]}
        >
          <SpanAnnotator selection={selection} setSelection={setSelection} />
        </AnnotationContext.Provider>
      </WithRealiaService>,
    )
  }

  it('does not offer a tag already on the selection', async () => {
    setupWith([
      entityAnnotationSpan({
        id: 'Entity-1',
        type: 'PERSONAL_NAME',
        span: selection,
      }),
    ])

    await userEvent.click(screen.getByLabelText('annotate-named-entities'))

    expect(screen.queryByText(testCategory)).not.toBeInTheDocument()
    expect(screen.getByText('DN: Divine Name')).toBeInTheDocument()
  })

  it('still offers a tag used on a different span', async () => {
    setupWith([
      entityAnnotationSpan({
        id: 'Entity-1',
        type: 'PERSONAL_NAME',
        span: ['Word-9'],
      }),
    ])

    await userEvent.click(screen.getByLabelText('annotate-named-entities'))

    expect(screen.getByText(testCategory)).toBeInTheDocument()
  })

  it('does not offer a realia already on the selection', async () => {
    setupWith([existingRealia])

    await userEvent.type(screen.getByLabelText('annotate-realia'), 'Apk')

    expect(await screen.findByText(/no options/i)).toBeInTheDocument()
    expect(screen.queryByText('Apkallu')).not.toBeInTheDocument()
  })

  it('still offers a realia used on a different span', async () => {
    setupWith([{ ...existingRealia, span: ['Word-9'] }])

    await userEvent.type(screen.getByLabelText('annotate-realia'), 'Apk')

    expect(await screen.findByText('Apkallu')).toBeInTheDocument()
  })
})
