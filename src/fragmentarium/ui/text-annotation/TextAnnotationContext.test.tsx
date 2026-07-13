import { renderHook, act } from '@testing-library/react'
import { useAnnotationContext } from 'fragmentarium/ui/text-annotation/TextAnnotationContext'
import {
  AnnotationSpans,
  ApiEntityAnnotationSpan,
  ApiRealiaAnnotationSpan,
  tagEntitySpan,
  tagRealiaSpan,
} from 'fragmentarium/ui/text-annotation/annotationSpan'

const words = ['Word-1', 'Word-2', 'Word-3']

const tag: ApiEntityAnnotationSpan = {
  id: 'Entity-1',
  type: 'PERSONAL_NAME',
  span: ['Word-1', 'Word-2'],
}
const realia: ApiRealiaAnnotationSpan = {
  id: 'Realia-1',
  realiaId: 'realia_000846',
  span: ['Word-1', 'Word-2'],
}

function spans(
  namedEntities: readonly ApiEntityAnnotationSpan[] = [],
  realiaSpans: readonly ApiRealiaAnnotationSpan[] = [],
): AnnotationSpans {
  return { namedEntities, realia: realiaSpans }
}

const tierOf = (
  annotations: readonly { id: string; tier: number }[],
  id: string,
): number => annotations.find((annotation) => annotation.id === id)?.tier ?? 0

describe('useAnnotationContext with both layers', () => {
  it('derives the display name of each layer', () => {
    const { result } = renderHook(() =>
      useAnnotationContext(words, spans([tag], [realia])),
    )

    expect(result.current[0].annotations.map(({ name }) => name)).toEqual([
      'Personal Name',
      'realia_000846',
    ])
  })

  it('places the tag layer above the realia layer', () => {
    const { result } = renderHook(() =>
      useAnnotationContext(words, spans([tag], [realia])),
    )
    const { annotations } = result.current[0]

    expect(tierOf(annotations, 'Entity-1')).toBe(1)
    expect(tierOf(annotations, 'Realia-1')).toBe(2)
  })

  it('keeps every realia below every tag, even when tags are nested', () => {
    const nestedTag: ApiEntityAnnotationSpan = {
      id: 'Entity-2',
      type: 'ROYAL_NAME',
      span: ['Word-1'],
    }
    const { result } = renderHook(() =>
      useAnnotationContext(words, spans([tag, nestedTag], [realia])),
    )
    const { annotations } = result.current[0]

    const deepestTag = Math.max(
      tierOf(annotations, 'Entity-1'),
      tierOf(annotations, 'Entity-2'),
    )
    expect(tierOf(annotations, 'Realia-1')).toBeGreaterThan(deepestTag)
  })

  it('falls back to the first tier for spans outside the word list', () => {
    const { result } = renderHook(() =>
      useAnnotationContext([], spans([tag], [realia])),
    )

    expect(result.current[0].annotations.map(({ tier }) => tier)).toEqual([
      1, 1,
    ])
  })

  it('adds a realia annotation', () => {
    const { result } = renderHook(() => useAnnotationContext(words))

    act(() => {
      result.current[1]({ type: 'add', annotation: tagRealiaSpan(realia) })
    })

    expect(result.current[0].annotations).toEqual([
      { ...tagRealiaSpan(realia), tier: 1, name: 'realia_000846' },
    ])
  })

  it('edits a realia annotation', () => {
    const { result } = renderHook(() =>
      useAnnotationContext(words, spans([], [realia])),
    )

    act(() => {
      result.current[1]({
        type: 'edit',
        annotation: tagRealiaSpan({ ...realia, realiaId: 'realia_000999' }),
      })
    })

    expect(result.current[0].annotations).toMatchObject([
      { id: 'Realia-1', realiaId: 'realia_000999', name: 'realia_000999' },
    ])
  })

  it('deletes a realia annotation without touching the tag layer', () => {
    const { result } = renderHook(() =>
      useAnnotationContext(words, spans([tag], [realia])),
    )

    act(() => {
      result.current[1]({ type: 'delete', annotation: realia })
    })

    expect(result.current[0].annotations).toEqual([
      { ...tagEntitySpan(tag), tier: 1, name: 'Personal Name' },
    ])
  })
})

describe('uniqueness', () => {
  it('ignores adding a tag that is already on the range', () => {
    const { result } = renderHook(() =>
      useAnnotationContext(words, spans([tag])),
    )

    act(() => {
      result.current[1]({
        type: 'add',
        annotation: tagEntitySpan({ ...tag, id: 'Entity-2' }),
      })
    })

    expect(result.current[0].annotations).toHaveLength(1)
  })

  it('ignores a duplicate whose span is in a different order', () => {
    const { result } = renderHook(() =>
      useAnnotationContext(words, spans([tag])),
    )

    act(() => {
      result.current[1]({
        type: 'add',
        annotation: tagEntitySpan({
          ...tag,
          id: 'Entity-2',
          span: ['Word-2', 'Word-1'],
        }),
      })
    })

    expect(result.current[0].annotations).toHaveLength(1)
  })

  it('ignores adding a realia that is already on the range', () => {
    const { result } = renderHook(() =>
      useAnnotationContext(words, spans([], [realia])),
    )

    act(() => {
      result.current[1]({
        type: 'add',
        annotation: tagRealiaSpan({ ...realia, id: 'Realia-2' }),
      })
    })

    expect(result.current[0].annotations).toHaveLength(1)
  })

  it('allows a tag and a realia on the same range', () => {
    const { result } = renderHook(() =>
      useAnnotationContext(words, spans([tag])),
    )

    act(() => {
      result.current[1]({ type: 'add', annotation: tagRealiaSpan(realia) })
    })

    expect(result.current[0].annotations).toHaveLength(2)
  })

  it('allows the same tag on a different range', () => {
    const { result } = renderHook(() =>
      useAnnotationContext(words, spans([tag])),
    )

    act(() => {
      result.current[1]({
        type: 'add',
        annotation: tagEntitySpan({
          ...tag,
          id: 'Entity-2',
          span: ['Word-3'],
        }),
      })
    })

    expect(result.current[0].annotations).toHaveLength(2)
  })

  it('ignores an edit that would duplicate another annotation', () => {
    const other: ApiEntityAnnotationSpan = {
      id: 'Entity-2',
      type: 'ROYAL_NAME',
      span: tag.span,
    }
    const { result } = renderHook(() =>
      useAnnotationContext(words, spans([tag, other])),
    )

    act(() => {
      result.current[1]({
        type: 'edit',
        annotation: tagEntitySpan({ ...other, type: tag.type }),
      })
    })

    expect(
      result.current[0].annotations.find(({ id }) => id === 'Entity-2'),
    ).toMatchObject({ type: 'ROYAL_NAME' })
  })

  it('allows editing an annotation into a value nothing else uses', () => {
    const { result } = renderHook(() =>
      useAnnotationContext(words, spans([tag])),
    )

    act(() => {
      result.current[1]({
        type: 'edit',
        annotation: tagEntitySpan({ ...tag, type: 'ROYAL_NAME' }),
      })
    })

    expect(result.current[0].annotations).toMatchObject([
      { id: 'Entity-1', type: 'ROYAL_NAME' },
    ])
  })

  it('drops duplicates already present in the loaded annotations', () => {
    const { result } = renderHook(() =>
      useAnnotationContext(
        words,
        spans([tag, { ...tag, id: 'Entity-2' }], [realia]),
      ),
    )

    expect(result.current[0].annotations.map(({ id }) => id)).toEqual([
      'Entity-1',
      'Realia-1',
    ])
  })
})
