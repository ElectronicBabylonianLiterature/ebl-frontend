import { renderHook, act } from '@testing-library/react'
import { useAnnotationContext } from 'fragmentarium/ui/text-annotation/TextAnnotationContext'
import {
  ApiEntityAnnotationSpan,
  NAMED_ENTITY_LAYER,
  REALIA_LAYER,
} from 'fragmentarium/ui/text-annotation/annotationSpan'
import {
  realia,
  spans,
  tag,
  words,
} from 'fragmentarium/ui/text-annotation/textAnnotationContext.testSupport'

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
