import React, { Dispatch, useReducer } from 'react'
import { EntityType } from 'fragmentarium/ui/fragment/lemma-annotation/SpanAnnotator'

export interface Entity {
  id: string
  span: readonly string[]
  type: EntityType
}

type State = readonly Entity[]
export type AnnotationContextService = [State, Dispatch<Action>]

type AddAction = {
  type: 'add'
  entity: Entity
}

export type Action = AddAction

const AnnotationContext = React.createContext<AnnotationContextService>([
  [],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  () => {},
])

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add':
      return [...state, action.entity]
  }
}

export function useAnnotationContext(
  initial: Entity[] = []
): AnnotationContextService {
  return useReducer(reducer, initial)
}

export default AnnotationContext
