import { act } from '@testing-library/react'
import {
  AnnotationTokenType,
  RawAnnotation,
} from 'fragmentarium/domain/annotation'
import {
  fragmentService,
  largeGeometry,
  resetAnnotationState,
  setUp,
  tinyGeometry,
} from 'fragmentarium/ui/image-annotation/annotation-tool/useFragmentAnnotationState.testSupport'
import { annotations as existingAnnotations } from 'test-support/test-annotation'

beforeEach(resetAnnotationState)

it('zooming rescales the content inversely', () => {
  const { result } = setUp()

  act(() => result.current.onZoom({ state: { scale: 4 } }))

  expect(result.current.contentScale).toBe(0.25)
})

it('toggling automatic selection flips it back and forth', () => {
  const { result } = setUp()

  act(() => result.current.toggleAutomaticSelection())
  expect(result.current.isAutomaticSelected).toBe(true)

  act(() => result.current.toggleAutomaticSelection())
  expect(result.current.isAutomaticSelected).toBe(false)
})

it('toggling the cards flips them back and forth', () => {
  const { result } = setUp()

  act(() => result.current.toggleDisplayCards())
  expect(result.current.displayCards).toBe(true)

  act(() => result.current.toggleDisplayCards())
  expect(result.current.displayCards).toBe(false)
})

it('adds an annotation for an unknown id with a large enough box', () => {
  const { result } = setUp([])

  act(() =>
    result.current.handleSelection({
      geometry: largeGeometry,
      data: {
        value: 'kur',
        type: AnnotationTokenType.HasSign,
        path: [1],
        signName: 'KUR',
      },
    } as RawAnnotation),
  )

  expect(result.current.annotations).toHaveLength(1)
  expect(result.current.annotation).toEqual({})
})

it('ignores a box that is too small to annotate', () => {
  const { result } = setUp([])

  act(() =>
    result.current.handleSelection({
      geometry: tinyGeometry,
      data: {
        value: 'kur',
        type: AnnotationTokenType.HasSign,
        path: [1],
        signName: 'KUR',
      },
    } as RawAnnotation),
  )

  expect(result.current.annotations).toHaveLength(0)
})

it('ignores a selection that carries no data', () => {
  const { result } = setUp([])

  act(() =>
    result.current.handleSelection({
      geometry: largeGeometry,
    } as RawAnnotation),
  )

  expect(result.current.annotations).toHaveLength(0)
})

it('ignores an unknown id with no geometry', () => {
  const { result } = setUp([])

  act(() =>
    result.current.handleSelection({
      data: { id: 'missing', value: 'kur' },
    } as RawAnnotation),
  )

  expect(result.current.annotations).toHaveLength(0)
})

it('replaces an annotation that is selected by its id', () => {
  const { result } = setUp()
  const existing = existingAnnotations[0]

  act(() =>
    result.current.handleSelection({
      data: { ...existing.data, value: 'renamed' },
    } as RawAnnotation),
  )

  expect(result.current.annotations).toHaveLength(1)
  expect(result.current.annotations[0].data.value).toBe('renamed')
  expect(result.current.isChangeExistingMode).toBe(false)
})

it('leaves change-existing mode when a new selection is drawn', () => {
  const { result } = setUp()

  act(() =>
    result.current.onChange({
      selection: { mode: 'SELECTING' },
    } as RawAnnotation),
  )

  expect(result.current.isChangeExistingMode).toBe(false)
  expect(result.current.toggled).toBeNull()
})

it('deleting an annotation saves what is left', async () => {
  const { result } = setUp()

  await act(() => result.current.onDelete(existingAnnotations[0]))

  expect(result.current.annotations).toHaveLength(0)
  expect(fragmentService.updateAnnotations).toHaveBeenCalledWith('K.1', [])
})

it('surfaces a failure to save', async () => {
  const error = new Error('save failed')
  fragmentService.updateAnnotations.mockRejectedValueOnce(error)
  const { result } = setUp()

  await act(() => result.current.onDelete(existingAnnotations[0]))

  expect(result.current.error).toBe(error)
})

it('saving the current annotations clears the saving flag', async () => {
  const { result } = setUp()

  await act(async () => result.current.saveCurrentAnnotations())

  expect(fragmentService.updateAnnotations).toHaveBeenCalledWith(
    'K.1',
    result.current.annotations,
  )
  expect(result.current.isSaving).toBe(false)
})

it('generating annotations appends them', async () => {
  const generated = existingAnnotations
  fragmentService.generateAnnotations.mockResolvedValueOnce(generated as never)
  const { result } = setUp([])

  await act(async () => result.current.generateAnnotations())

  expect(result.current.annotations).toEqual(generated)
  expect(result.current.isGenerateAnnotationsLoading).toBe(false)
})

it('surfaces a failure to generate annotations', async () => {
  const error = new Error('generation failed')
  fragmentService.generateAnnotations.mockRejectedValueOnce(error)
  const { result } = setUp([])

  await act(async () => result.current.generateAnnotations())

  expect(result.current.error).toBe(error)
})

describe('deleting everything', () => {
  it('saves an empty list once confirmed', async () => {
    window.confirm = jest.fn().mockReturnValue(true)
    const { result } = setUp()

    await act(async () => result.current.deleteAllAnnotations())

    expect(fragmentService.updateAnnotations).toHaveBeenCalledWith('K.1', [])
    expect(result.current.isDeleting).toBe(false)
  })

  it('does nothing when the confirmation is declined', async () => {
    window.confirm = jest.fn().mockReturnValue(false)
    const { result } = setUp()

    await act(async () => result.current.deleteAllAnnotations())

    expect(fragmentService.updateAnnotations).not.toHaveBeenCalled()
  })
})
