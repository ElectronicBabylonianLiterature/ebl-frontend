import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { clearSelection } from 'fragmentarium/ui/text-annotation/SpanAnnotator'
import {
  entityAnnotationSpan,
  realiaAnnotationSpan,
} from 'fragmentarium/ui/text-annotation/textAnnotation.testSupport'
import { RealiaAnnotationSpan } from 'fragmentarium/ui/text-annotation/annotationSpan'
import {
  setupSpanAnnotator,
  selection,
  stateOf,
  testCategory,
} from 'fragmentarium/ui/text-annotation/spanAnnotator.testSupport'

jest.mock('realia/application/RealiaService')

describe('SpanAnnotator uniqueness', () => {
  const existingRealia: RealiaAnnotationSpan = realiaAnnotationSpan({
    id: 'Realia-1',
    realiaId: 'realia_000846',
    span: selection,
  })

  it('does not offer a tag already on the selection', async () => {
    setupSpanAnnotator(
      stateOf([
        entityAnnotationSpan({
          id: 'Entity-1',
          type: 'PERSONAL_NAME',
          span: selection,
        }),
      ]),
    )

    await userEvent.click(screen.getByLabelText('annotate-named-entities'))

    expect(screen.queryByText(testCategory)).not.toBeInTheDocument()
    expect(screen.getByText('DN: Divine Name')).toBeInTheDocument()
  })

  it('still offers a tag used on a different span', async () => {
    setupSpanAnnotator(
      stateOf([
        entityAnnotationSpan({
          id: 'Entity-1',
          type: 'PERSONAL_NAME',
          span: ['Word-9'],
        }),
      ]),
    )

    await userEvent.click(screen.getByLabelText('annotate-named-entities'))

    expect(screen.getByText(testCategory)).toBeInTheDocument()
  })

  it('does not offer a realia already on the selection', async () => {
    setupSpanAnnotator(stateOf([], [existingRealia]))

    await userEvent.type(screen.getByLabelText('annotate-realia'), 'Apk')

    expect(await screen.findByText(/no options/i)).toBeInTheDocument()
    expect(screen.queryByText('Apkallu')).not.toBeInTheDocument()
  })

  it('still offers a realia used on a different span', async () => {
    setupSpanAnnotator(stateOf([], [{ ...existingRealia, span: ['Word-9'] }]))

    await userEvent.type(screen.getByLabelText('annotate-realia'), 'Apk')

    expect(await screen.findByText('Apkallu')).toBeInTheDocument()
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
