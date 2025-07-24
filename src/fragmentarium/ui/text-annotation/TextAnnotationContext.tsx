import { EntityAnnotationSpan } from 'fragmentarium/ui/text-annotation/EntityType'
import _ from 'lodash'
import React, { Dispatch, useReducer } from 'react'

type State = {
  entities: readonly EntityAnnotationSpan[]
  words: readonly string[]
}
export type AnnotationContextService = [State, Dispatch<Action>]

type AddAction = {
  type: 'add'
  entity: EntityAnnotationSpan
}
type EditAction = {
  type: 'edit'
  entity: EntityAnnotationSpan
}
type DeleteAction = {
  type: 'delete'
  entity: EntityAnnotationSpan
}

export type Action = AddAction | EditAction | DeleteAction

const AnnotationContext = React.createContext<AnnotationContextService>([
  { entities: [], words: [] },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  () => {},
])

function createSpanBoundaryMaps(
  entities: readonly EntityAnnotationSpan[]
): [Map<string, string[]>, Map<string, string[]>] {
  const spanStarts = new Map<string, string[]>()
  const spanEnds = new Map<string, string[]>()

  _.sortBy(entities, ({ span }) => -span.length).forEach(({ span, id }) => {
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
  entities: readonly EntityAnnotationSpan[]
): readonly EntityAnnotationSpan[] {
  const [spanStarts, spanEnds] = createSpanBoundaryMaps(entities)

  const tiers = new Map<string, number>()
  const tierQueue = new Map<string, number>()
  const popStack = new Set<string>()

  words.forEach((wordId) => {
    popStack.forEach((entityId) => tierQueue.delete(entityId))
    popStack.clear()
    spanStarts.get(wordId)?.forEach((entityId) => {
      if (!tierQueue.has(entityId)) {
        const openTier = getLowestOpenTier([...tierQueue.values()])

        tierQueue.set(entityId, openTier)
        tiers.set(entityId, openTier)
      }
    })
    spanEnds.get(wordId)?.forEach((entityId) => popStack.add(entityId))
  })

  return entities.map((entity) => ({
    ...entity,
    tier: tiers.get(entity.id) || 1,
  }))
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add':
      return {
        ...state,
        entities: setTiers(state.words, [...state.entities, action.entity]),
      }
    case 'edit':
      return {
        ...state,
        entities: [
          ...state.entities.filter((entity) => entity.id !== action.entity.id),
          action.entity,
        ],
      }
    case 'delete':
      return {
        ...state,
        entities: setTiers(
          state.words,
          state.entities.filter((entity) => entity.id !== action.entity.id)
        ),
      }
  }
}

export function useAnnotationContext(
  words: readonly string[],
  initial: readonly EntityAnnotationSpan[] = []
): AnnotationContextService {
  return useReducer(reducer, { entities: setTiers(words, initial), words })
}

export default AnnotationContext
