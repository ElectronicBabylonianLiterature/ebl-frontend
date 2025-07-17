import { EntityAnnotationSpan } from 'fragmentarium/ui/fragment/lemma-annotation/EntityType'
import React, { Dispatch, useReducer } from 'react'

type State = readonly EntityAnnotationSpan[]
export type AnnotationContextService = [State, Dispatch<Action>]

type AddAction = {
  type: 'add'
  entity: EntityAnnotationSpan
}

export type Action = AddAction

const AnnotationContext = React.createContext<AnnotationContextService>([
  [],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  () => {},
])

const testEntities: readonly EntityAnnotationSpan[] = [
  {
    id: 'E-1',
    type: 'LOCATION',
    span: ['Word-1', 'Word-2', 'Word-3', 'Word-4'],
    tier: 1,
  },
  {
    id: 'E-2',
    type: 'PERSON',
    span: ['Word-3', 'Word-4', 'Word-5', 'Word-6', 'Word-8'],
    tier: 2,
  },
  { id: 'E-3', type: 'LOCATION', span: ['Word-5', 'Word-6'], tier: 1 },
  {
    id: 'E-4',
    type: 'PERSON',
    span: ['Word-22', 'Word-23', 'Word-24'],
    tier: 1,
  },
]

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add':
      console.log([...state, action.entity])
      return [...state, action.entity]
  }
}

export function useAnnotationContext(
  initial: readonly EntityAnnotationSpan[] = testEntities
): AnnotationContextService {
  return useReducer(reducer, initial)
}

export default AnnotationContext
