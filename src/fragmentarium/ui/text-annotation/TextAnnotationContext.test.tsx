import { renderHook, act } from '@testing-library/react'
import { useAnnotationContext } from 'fragmentarium/ui/text-annotation/TextAnnotationContext'
import {
  ApiEntityAnnotationSpan,
  ApiRealiaAnnotationSpan,
} from 'fragmentarium/ui/text-annotation/annotationSpan'

const words = ['Word-1', 'Word-2', 'Word-3']

const entitySpan: ApiEntityAnnotationSpan = {
  id: 'Entity-1',
  type: 'PERSONAL_NAME',
  span: ['Word-1', 'Word-2'],
}

const realiaSpan: ApiRealiaAnnotationSpan = {
  id: 'Realia-1',
  realiaId: 'realia_000846',
  span: ['Word-1', 'Word-2'],
}

describe('useAnnotationContext with both layers', () => {
  it('derives the display name of each layer', () => {
    const { result } = renderHook(() =>
      useAnnotationContext(words, [entitySpan, realiaSpan]),
    )
    const [{ annotations }] = result.current

    expect(annotations.map(({ name }) => name)).toEqual([
      'Personal Name',
      'realia_000846',
    ])
  })

  it('tiers overlapping spans of different layers separately', () => {
    const { result } = renderHook(() =>
      useAnnotationContext(words, [entitySpan, realiaSpan]),
    )
    const [{ annotations }] = result.current
    const tiers = annotations.map(({ tier }) => tier)

    expect(new Set(tiers).size).toBe(2)
  })

  it('places the tag layer above the realia layer', () => {
    const { result } = renderHook(() =>
      useAnnotationContext(words, [realiaSpan, entitySpan]),
    )
    const [{ annotations }] = result.current
    const tierOf = (id: string) =>
      annotations.find((annotation) => annotation.id === id)?.tier

    expect(tierOf('Entity-1')).toBe(1)
    expect(tierOf('Realia-1')).toBe(2)
  })

  it('keeps every realia span below every tag, even when tags are nested', () => {
    const nestedTag: ApiEntityAnnotationSpan = {
      id: 'Entity-2',
      type: 'ROYAL_NAME',
      span: ['Word-1'],
    }
    const { result } = renderHook(() =>
      useAnnotationContext(words, [entitySpan, nestedTag, realiaSpan]),
    )
    const [{ annotations }] = result.current
    const tierOf = (id: string) =>
      annotations.find((annotation) => annotation.id === id)?.tier as number

    const deepestTag = Math.max(tierOf('Entity-1'), tierOf('Entity-2'))
    expect(tierOf('Realia-1')).toBeGreaterThan(deepestTag)
  })

  it('falls back to the first tier for spans outside the word list', () => {
    const { result } = renderHook(() =>
      useAnnotationContext([], [entitySpan, realiaSpan]),
    )
    const [{ annotations }] = result.current

    expect(annotations.map(({ tier }) => tier)).toEqual([1, 1])
  })

  it('adds a realia annotation', () => {
    const { result } = renderHook(() => useAnnotationContext(words))

    act(() => {
      result.current[1]({ type: 'add', annotation: realiaSpan })
    })

    expect(result.current[0].annotations).toEqual([
      { ...realiaSpan, tier: 1, name: 'realia_000846' },
    ])
  })

  it('edits a realia annotation', () => {
    const { result } = renderHook(() =>
      useAnnotationContext(words, [realiaSpan]),
    )

    act(() => {
      result.current[1]({
        type: 'edit',
        annotation: { ...realiaSpan, realiaId: 'realia_000999' },
      })
    })

    expect(result.current[0].annotations).toEqual([
      {
        ...realiaSpan,
        realiaId: 'realia_000999',
        tier: 1,
        name: 'realia_000999',
      },
    ])
  })

  it('deletes a realia annotation without touching the entity layer', () => {
    const { result } = renderHook(() =>
      useAnnotationContext(words, [entitySpan, realiaSpan]),
    )

    act(() => {
      result.current[1]({ type: 'delete', annotation: realiaSpan })
    })

    expect(result.current[0].annotations).toEqual([
      { ...entitySpan, tier: 1, name: 'Personal Name' },
    ])
  })
})

describe('uniqueness', () => {
  it('ignores adding a tag that is already on the span', () => {
    const { result } = renderHook(() =>
      useAnnotationContext(words, [entitySpan]),
    )

    act(() => {
      result.current[1]({
        type: 'add',
        annotation: { ...entitySpan, id: 'Entity-2' },
      })
    })

    expect(result.current[0].annotations).toHaveLength(1)
  })

  it('ignores adding a realia that is already on the span', () => {
    const { result } = renderHook(() =>
      useAnnotationContext(words, [realiaSpan]),
    )

    act(() => {
      result.current[1]({
        type: 'add',
        annotation: { ...realiaSpan, id: 'Realia-2' },
      })
    })

    expect(result.current[0].annotations).toHaveLength(1)
  })

  it('allows the same tag on a different span', () => {
    const { result } = renderHook(() =>
      useAnnotationContext(words, [entitySpan]),
    )

    act(() => {
      result.current[1]({
        type: 'add',
        annotation: { ...entitySpan, id: 'Entity-2', span: ['Word-3'] },
      })
    })

    expect(result.current[0].annotations).toHaveLength(2)
  })

  it('ignores an edit that would duplicate another annotation', () => {
    const other: ApiEntityAnnotationSpan = {
      id: 'Entity-2',
      type: 'ROYAL_NAME',
      span: entitySpan.span,
    }
    const { result } = renderHook(() =>
      useAnnotationContext(words, [entitySpan, other]),
    )

    act(() => {
      result.current[1]({
        type: 'edit',
        annotation: { ...other, type: entitySpan.type },
      })
    })

    expect(
      result.current[0].annotations.find(({ id }) => id === 'Entity-2'),
    ).toMatchObject({ type: 'ROYAL_NAME' })
  })

  it('allows editing an annotation without changing it', () => {
    const { result } = renderHook(() =>
      useAnnotationContext(words, [entitySpan]),
    )

    act(() => {
      result.current[1]({
        type: 'edit',
        annotation: { ...entitySpan, type: 'ROYAL_NAME' },
      })
    })

    expect(result.current[0].annotations).toMatchObject([
      { id: 'Entity-1', type: 'ROYAL_NAME' },
    ])
  })

  it('drops duplicates already present in the loaded annotations', () => {
    const { result } = renderHook(() =>
      useAnnotationContext(words, [
        entitySpan,
        { ...entitySpan, id: 'Entity-2' },
        realiaSpan,
      ]),
    )

    expect(result.current[0].annotations.map(({ id }) => id)).toEqual([
      'Entity-1',
      'Realia-1',
    ])
  })
})
