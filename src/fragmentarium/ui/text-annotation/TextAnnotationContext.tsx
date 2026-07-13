import {
  AnnotationSpan,
  AnnotationSpans,
  annotationSpanName,
  dedupeAnnotations,
  emptyAnnotationSpans,
  isDuplicateAnnotation,
  isEntityAnnotationSpan,
  isRealiaAnnotationSpan,
  TaggedAnnotationSpan,
  toTaggedSpans,
} from 'fragmentarium/ui/text-annotation/annotationSpan'
import _ from 'lodash'
import React, { Dispatch, useReducer } from 'react'

type State = {
  annotations: readonly AnnotationSpan[]
  words: readonly string[]
}
export type AnnotationContextService = [State, Dispatch<Action>]

type AddAction = {
  type: 'add'
  annotation: TaggedAnnotationSpan
}
type EditAction = {
  type: 'edit'
  annotation: TaggedAnnotationSpan
}
type DeleteAction = {
  type: 'delete'
  annotation: { id: string }
}

export type Action = AddAction | EditAction | DeleteAction

const AnnotationContext = React.createContext<AnnotationContextService>([
  { annotations: [], words: [] },
  () => {},
])

function createSpanBoundaryMaps(
  annotations: readonly TaggedAnnotationSpan[],
): [Map<string, string[]>, Map<string, string[]>] {
  const spanStarts = new Map<string, string[]>()
  const spanEnds = new Map<string, string[]>()

  _.sortBy(annotations, ({ span }) => -span.length).forEach(({ span, id }) => {
    const start = span[0]
    const end = span[span.length - 1]

    spanStarts.set(start, [...(spanStarts.get(start) || []), id])
    spanEnds.set(end, [...(spanEnds.get(end) || []), id])
  })

  return [spanStarts, spanEnds]
}

function getLowestOpenTier(occupiedTiers: number[]): number {
  let tier = 1
  while (occupiedTiers.includes(tier)) {
    tier++
  }
  return tier
}

function computeLayerTiers(
  words: readonly string[],
  annotations: readonly TaggedAnnotationSpan[],
): Map<string, number> {
  const [spanStarts, spanEnds] = createSpanBoundaryMaps(annotations)

  const tiers = new Map<string, number>()
  const tierQueue = new Map<string, number>()
  const popStack = new Set<string>()

  words.forEach((wordId) => {
    popStack.forEach((annotationId) => tierQueue.delete(annotationId))
    popStack.clear()
    spanStarts.get(wordId)?.forEach((annotationId) => {
      if (!tierQueue.has(annotationId)) {
        const openTier = getLowestOpenTier([...tierQueue.values()])

        tierQueue.set(annotationId, openTier)
        tiers.set(annotationId, openTier)
      }
    })
    spanEnds.get(wordId)?.forEach((annotationId) => popStack.add(annotationId))
  })

  return tiers
}

function setTiers(
  words: readonly string[],
  annotations: readonly TaggedAnnotationSpan[],
): readonly AnnotationSpan[] {
  const entityTiers = computeLayerTiers(
    words,
    annotations.filter(isEntityAnnotationSpan),
  )
  const realiaTiers = computeLayerTiers(
    words,
    annotations.filter(isRealiaAnnotationSpan),
  )
  const entityDepth = _.max([...entityTiers.values()]) || 0

  return annotations.map((annotation) => ({
    ...annotation,
    tier: isRealiaAnnotationSpan(annotation)
      ? entityDepth + (realiaTiers.get(annotation.id) || 1)
      : entityTiers.get(annotation.id) || 1,
    name: annotationSpanName(annotation),
  }))
}

function withoutId(
  annotations: readonly AnnotationSpan[],
  id: string,
): readonly TaggedAnnotationSpan[] {
  return annotations.filter((annotation) => annotation.id !== id)
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add':
      return isDuplicateAnnotation(state.annotations, action.annotation)
        ? state
        : {
            ...state,
            annotations: setTiers(state.words, [
              ...state.annotations,
              action.annotation,
            ]),
          }
    case 'edit':
      return isDuplicateAnnotation(state.annotations, action.annotation)
        ? state
        : {
            ...state,
            annotations: setTiers(state.words, [
              ...withoutId(state.annotations, action.annotation.id),
              action.annotation,
            ]),
          }
    case 'delete':
      return {
        ...state,
        annotations: setTiers(
          state.words,
          withoutId(state.annotations, action.annotation.id),
        ),
      }
  }
}

export function useAnnotationContext(
  words: readonly string[],
  initial: AnnotationSpans = emptyAnnotationSpans,
): AnnotationContextService {
  return useReducer(reducer, {
    annotations: setTiers(words, dedupeAnnotations(toTaggedSpans(initial))),
    words,
  })
}

export default AnnotationContext
