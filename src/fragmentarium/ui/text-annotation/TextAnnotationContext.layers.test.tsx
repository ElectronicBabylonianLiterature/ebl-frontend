import { renderHook, act } from '@testing-library/react'
import { useContext } from 'react'
import AnnotationContext, {
  Action,
  useAnnotationContext,
} from 'fragmentarium/ui/text-annotation/TextAnnotationContext'
import {
  ApiEntityAnnotationSpan,
  NAMED_ENTITY_LAYER,
  REALIA_LAYER,
} from 'fragmentarium/ui/text-annotation/annotationSpan'
import {
  realia,
  spans,
  tag,
  tierOf,
  words,
} from 'fragmentarium/ui/text-annotation/textAnnotationContext.testSupport'

type LayerKey = 'namedEntities' | 'realia'

interface LayerScenario {
  readonly name: string
  readonly action: Action
  readonly present: LayerKey
  readonly empty: LayerKey
  readonly id: string
}

const addScenarios: readonly LayerScenario[] = [
  {
    name: 'realia',
    action: { type: 'add', layer: REALIA_LAYER, annotation: realia },
    present: 'realia',
    empty: 'namedEntities',
    id: 'Realia-1',
  },
  {
    name: 'tag',
    action: { type: 'add', layer: NAMED_ENTITY_LAYER, annotation: tag },
    present: 'namedEntities',
    empty: 'realia',
    id: 'Entity-1',
  },
]

const deleteScenarios: readonly LayerScenario[] = [
  {
    name: 'realia',
    action: { type: 'delete', layer: REALIA_LAYER, id: 'Realia-1' },
    present: 'namedEntities',
    empty: 'realia',
    id: 'Entity-1',
  },
  {
    name: 'tag',
    action: { type: 'delete', layer: NAMED_ENTITY_LAYER, id: 'Entity-1' },
    present: 'realia',
    empty: 'namedEntities',
    id: 'Realia-1',
  },
]

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

  it.each(addScenarios)(
    'adds a $name to the $present collection only',
    ({ action, present, empty, id }) => {
      const { result } = renderHook(() => useAnnotationContext(words))

      act(() => result.current[1](action))
      const [state] = result.current

      expect(state[present]).toMatchObject([{ id }])
      expect(state[empty]).toEqual([])
    },
  )

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

  it.each(deleteScenarios)(
    'deletes a $name without touching the other layer',
    ({ action, present, empty, id }) => {
      const { result } = renderHook(() =>
        useAnnotationContext(words, spans([tag], [realia])),
      )

      act(() => result.current[1](action))
      const [state] = result.current

      expect(state[empty]).toEqual([])
      expect(state[present]).toMatchObject([{ id }])
    },
  )

  it('exposes a no-op dispatch when consumed without a provider', () => {
    const { result } = renderHook(() => useContext(AnnotationContext))
    const [, dispatch] = result.current

    expect(() =>
      dispatch({ type: 'delete', layer: REALIA_LAYER, id: 'Realia-1' }),
    ).not.toThrow()
  })
})
