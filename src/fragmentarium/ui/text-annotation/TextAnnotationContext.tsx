import {
  AnnotationSpan,
  ApiAnnotationSpan,
  ApiAnnotationSpanBase,
  annotationSpanName,
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
  annotation: ApiAnnotationSpan
}
type EditAction = {
  type: 'edit'
  annotation: ApiAnnotationSpan
}
type DeleteAction = {
  type: 'delete'
  annotation: ApiAnnotationSpanBase
}

export type Action = AddAction | EditAction | DeleteAction

const AnnotationContext = React.createContext<AnnotationContextService>([
  { annotations: [], words: [] },
  () => {},
])

function createSpanBoundaryMaps(
  annotations: readonly ApiAnnotationSpan[],
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

function setTiers(
  words: readonly string[],
  annotations: readonly ApiAnnotationSpan[],
): readonly AnnotationSpan[] {
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

  return annotations.map((annotation) => ({
    ...annotation,
    tier: tiers.get(annotation.id) || 1,
    name: annotationSpanName(annotation),
  }))
}

function withoutId(
  annotations: readonly AnnotationSpan[],
  id: string,
): readonly ApiAnnotationSpan[] {
  return annotations.filter((annotation) => annotation.id !== id)
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add':
      return {
        ...state,
        annotations: setTiers(state.words, [
          ...state.annotations,
          action.annotation,
        ]),
      }
    case 'edit':
      return {
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
  initial: readonly ApiAnnotationSpan[] = [],
): AnnotationContextService {
  return useReducer(reducer, { annotations: setTiers(words, initial), words })
}

export default AnnotationContext
