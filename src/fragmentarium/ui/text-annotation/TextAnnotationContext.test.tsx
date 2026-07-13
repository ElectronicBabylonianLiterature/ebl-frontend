import { renderHook, act } from '@testing-library/react'
import { useAnnotationContext } from 'fragmentarium/ui/text-annotation/TextAnnotationContext'
import {
  AnnotationSpans,
  ApiEntityAnnotationSpan,
  ApiRealiaAnnotationSpan,
  NAMED_ENTITY_LAYER,
  REALIA_LAYER,
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

describe('useAnnotationContext keeps the layers apart', () => {
  it('exposes each kind in its own collection', () => {
    const { result } = renderHook(() =>
      useAnnotationContext(words, spans([tag], [realia])),
    )
    const [state] = result.current

    expect(state.namedEntities.map(({ id }) => id)).toEqual(['Entity-1'])
    expect(state.realia.map(({ id }) => id)).toEqual(['Realia-1'])
  })

  it('derives the display name of each kind', () => {
    const { result } = renderHook(() =>
      useAnnotationContext(words, spans([tag], [realia])),
    )
    const [state] = result.current

    expect(state.namedEntities[0].name).toBe('Personal Name')
    expect(state.realia[0].name).toBe('realia_000846')
  })

  it('places the tag layer above the realia layer', () => {
    const { result } = renderHook(() =>
      useAnnotationContext(words, spans([tag], [realia])),
    )
    const [state] = result.current

    expect(tierOf(state.namedEntities, 'Entity-1')).toBe(1)
    expect(tierOf(state.realia, 'Realia-1')).toBe(2)
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
    const [state] = result.current

    const deepestTag = Math.max(...state.namedEntities.map(({ tier }) => tier))
    expect(tierOf(state.realia, 'Realia-1')).toBeGreaterThan(deepestTag)
  })

  it('falls back to the first tier for spans outside the word list', () => {
    const { result } = renderHook(() =>
      useAnnotationContext([], spans([tag], [realia])),
    )
    const [state] = result.current

    expect(state.namedEntities[0].tier).toBe(1)
    expect(state.realia[0].tier).toBe(1)
  })

  it('adds a realia annotation to the realia collection only', () => {
    const { result } = renderHook(() => useAnnotationContext(words))

    act(() => {
      result.current[1]({
        type: 'add',
        layer: REALIA_LAYER,
        annotation: realia,
      })
    })
    const [state] = result.current

    expect(state.realia).toMatchObject([{ id: 'Realia-1' }])
    expect(state.namedEntities).toEqual([])
  })

  it('adds a tag to the tag collection only', () => {
    const { result } = renderHook(() => useAnnotationContext(words))

    act(() => {
      result.current[1]({
        type: 'add',
        layer: NAMED_ENTITY_LAYER,
        annotation: tag,
      })
    })
    const [state] = result.current

    expect(state.namedEntities).toMatchObject([{ id: 'Entity-1' }])
    expect(state.realia).toEqual([])
  })

  it('edits a realia annotation', () => {
    const { result } = renderHook(() =>
      useAnnotationContext(words, spans([], [realia])),
    )

    act(() => {
      result.current[1]({
        type: 'edit',
        layer: REALIA_LAYER,
        annotation: { ...realia, realiaId: 'realia_000999' },
      })
    })

    expect(result.current[0].realia).toMatchObject([
      { id: 'Realia-1', realiaId: 'realia_000999', name: 'realia_000999' },
    ])
  })

  it('deletes a realia annotation without touching the tag layer', () => {
    const { result } = renderHook(() =>
      useAnnotationContext(words, spans([tag], [realia])),
    )

    act(() => {
      result.current[1]({
        type: 'delete',
        layer: REALIA_LAYER,
        id: 'Realia-1',
      })
    })
    const [state] = result.current

    expect(state.realia).toEqual([])
    expect(state.namedEntities).toMatchObject([{ id: 'Entity-1' }])
  })

  it('deletes a tag without touching the realia layer', () => {
    const { result } = renderHook(() =>
      useAnnotationContext(words, spans([tag], [realia])),
    )

    act(() => {
      result.current[1]({
        type: 'delete',
        layer: NAMED_ENTITY_LAYER,
        id: 'Entity-1',
      })
    })
    const [state] = result.current

    expect(state.namedEntities).toEqual([])
    expect(state.realia).toMatchObject([{ id: 'Realia-1' }])
  })
})

describe('uniqueness within each kind', () => {
  it('ignores adding a tag that is already on the range', () => {
    const { result } = renderHook(() =>
      useAnnotationContext(words, spans([tag])),
    )

    act(() => {
      result.current[1]({
        type: 'add',
        layer: NAMED_ENTITY_LAYER,
        annotation: { ...tag, id: 'Entity-2' },
      })
    })

    expect(result.current[0].namedEntities).toHaveLength(1)
  })

  it('ignores a duplicate whose span is in a different order', () => {
    const { result } = renderHook(() =>
      useAnnotationContext(words, spans([tag])),
    )

    act(() => {
      result.current[1]({
        type: 'add',
        layer: NAMED_ENTITY_LAYER,
        annotation: { ...tag, id: 'Entity-2', span: ['Word-2', 'Word-1'] },
      })
    })

    expect(result.current[0].namedEntities).toHaveLength(1)
  })

  it('ignores adding a realia that is already on the range', () => {
    const { result } = renderHook(() =>
      useAnnotationContext(words, spans([], [realia])),
    )

    act(() => {
      result.current[1]({
        type: 'add',
        layer: REALIA_LAYER,
        annotation: { ...realia, id: 'Realia-2' },
      })
    })

    expect(result.current[0].realia).toHaveLength(1)
  })

  it('allows a tag and a realia on the same range', () => {
    const { result } = renderHook(() =>
      useAnnotationContext(words, spans([tag])),
    )

    act(() => {
      result.current[1]({
        type: 'add',
        layer: REALIA_LAYER,
        annotation: realia,
      })
    })
    const [state] = result.current

    expect(state.namedEntities).toHaveLength(1)
    expect(state.realia).toHaveLength(1)
  })

  it('allows the same tag on a different range', () => {
    const { result } = renderHook(() =>
      useAnnotationContext(words, spans([tag])),
    )

    act(() => {
      result.current[1]({
        type: 'add',
        layer: NAMED_ENTITY_LAYER,
        annotation: { ...tag, id: 'Entity-2', span: ['Word-3'] },
      })
    })

    expect(result.current[0].namedEntities).toHaveLength(2)
  })

  it('ignores an edit that would duplicate another tag', () => {
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
        layer: NAMED_ENTITY_LAYER,
        annotation: { ...other, type: tag.type },
      })
    })

    expect(
      result.current[0].namedEntities.find(({ id }) => id === 'Entity-2'),
    ).toMatchObject({ type: 'ROYAL_NAME' })
  })

  it('allows editing a tag into a value nothing else uses', () => {
    const { result } = renderHook(() =>
      useAnnotationContext(words, spans([tag])),
    )

    act(() => {
      result.current[1]({
        type: 'edit',
        layer: NAMED_ENTITY_LAYER,
        annotation: { ...tag, type: 'ROYAL_NAME' },
      })
    })

    expect(result.current[0].namedEntities).toMatchObject([
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
    const [state] = result.current

    expect(state.namedEntities.map(({ id }) => id)).toEqual(['Entity-1'])
    expect(state.realia.map(({ id }) => id)).toEqual(['Realia-1'])
  })
})
