import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { getEntityTypeOption } from 'fragmentarium/ui/text-annotation/SpanAnnotator'
import { EntityType } from 'fragmentarium/ui/text-annotation/EntityType'
import { entityAnnotationSpan } from 'fragmentarium/ui/text-annotation/textAnnotation.testSupport'
import {
  existingTag,
  mockDispatch,
  setupSpanAnnotator,
  selectRealia,
  selection,
  setSelection,
  stateOf,
  testCategory,
  unmappedRealiaEntry,
} from 'fragmentarium/ui/text-annotation/spanAnnotator.testSupport'

jest.mock('realia/application/RealiaService')

describe('getEntityTypeOption', () => {
  it('returns the labelled option for a known entity type', () => {
    expect(getEntityTypeOption('PERSONAL_NAME')).toEqual({
      value: 'PERSONAL_NAME',
      label: testCategory,
    })
  })

  it('falls back to the raw type when it is not a known entity type', () => {
    expect(getEntityTypeOption('UNMAPPED' as EntityType)).toEqual({
      value: 'UNMAPPED',
      label: 'UNMAPPED',
    })
  })
})

describe('SpanAnnotator', () => {
  it('shows the selection menu', () => {
    const container = setupSpanAnnotator()
    expect(container).toMatchSnapshot()
  })

  it('shows the options', async () => {
    setupSpanAnnotator()
    const input = screen.getByLabelText('annotate-named-entities')
    await userEvent.click(input)
    expect(screen.getByText(testCategory)).toBeInTheDocument()
  })

  it('sets the option on click', async () => {
    setupSpanAnnotator()
    const input = screen.getByLabelText('annotate-named-entities')
    await userEvent.click(input)
    await userEvent.click(screen.getByText(testCategory))
    expect(setSelection).toHaveBeenCalledWith([])
  })

  it('dispatches add action when option is selected', async () => {
    setupSpanAnnotator()
    const input = screen.getByLabelText('annotate-named-entities')
    await userEvent.click(input)
    await userEvent.click(screen.getByText(testCategory))

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'add',
      layer: 'namedEntities',
      annotation: {
        id: 'Entity-1',
        type: 'PERSONAL_NAME',
        span: selection,
      },
    })
  })

  it('dispatches add action with the realiaId when a realia entry is selected', async () => {
    setupSpanAnnotator()
    const input = screen.getByLabelText('annotate-realia')
    await userEvent.type(input, 'Apk')
    await userEvent.click(await screen.findByText('Apkallu'))

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'add',
      layer: 'realia',
      annotation: {
        id: 'Realia-1',
        realiaId: 'realia_000846',
        span: selection,
      },
    })
    expect(setSelection).toHaveBeenCalledWith([])
  })

  it('numbers realia ids independently of entity ids', async () => {
    setupSpanAnnotator(
      stateOf([
        entityAnnotationSpan({
          id: 'Entity-7',
          type: 'PERSONAL_NAME',
          span: ['Word-1'],
        }),
      ]),
    )
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
      setupSpanAnnotator()
      await selectRealia()

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'add',
        layer: 'namedEntities',
        annotation: {
          id: 'Entity-1',
          type: 'DIVINE_NAME',
          span: selection,
        },
      })
      expect(mockDispatch).toHaveBeenCalledTimes(2)
    })

    it('does not add a tag when the span already has one', async () => {
      setupSpanAnnotator(stateOf([existingTag]))
      await selectRealia()

      expect(mockDispatch).toHaveBeenCalledTimes(1)
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          annotation: expect.objectContaining({ realiaId: 'realia_000846' }),
        }),
      )
    })

    it('adds a tag when the existing tag covers a different span', async () => {
      setupSpanAnnotator(stateOf([{ ...existingTag, span: ['Word-9'] }]))
      await selectRealia()

      expect(mockDispatch).toHaveBeenCalledTimes(2)
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          annotation: expect.objectContaining({ type: 'DIVINE_NAME' }),
        }),
      )
    })

    it('does not add a tag when the classification is not mapped', async () => {
      setupSpanAnnotator(stateOf(), [unmappedRealiaEntry])
      await selectRealia('Ziggurat')

      expect(mockDispatch).toHaveBeenCalledTimes(1)
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          annotation: expect.objectContaining({ realiaId: 'realia_000999' }),
        }),
      )
    })

    it('adds nothing when the tag selection is cleared', async () => {
      setupSpanAnnotator()
      const input = screen.getByLabelText('annotate-named-entities')
      await userEvent.click(input)
      await userEvent.click(screen.getByText(testCategory))
      mockDispatch.mockClear()

      await userEvent.type(input, '{backspace}')

      expect(mockDispatch).not.toHaveBeenCalled()
    })

    it('adds nothing when the realia selection is cleared', async () => {
      setupSpanAnnotator()
      await userEvent.type(
        screen.getByLabelText('annotate-realia'),
        '{backspace}',
      )

      expect(mockDispatch).not.toHaveBeenCalled()
    })
  })
})
