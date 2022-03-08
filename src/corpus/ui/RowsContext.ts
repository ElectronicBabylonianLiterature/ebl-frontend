import produce from 'immer'
import React, { Dispatch, useReducer } from 'react'
import flow from 'lodash/fp/flow'
import range from 'lodash/fp/range'
import map from 'lodash/fp/map'
import fromPairs from 'lodash/fp/fromPairs'
import mapValues from 'lodash/fp/mapValues'

interface RowState {
  readonly score: boolean
  readonly note: boolean
}
type State = { readonly [key: number]: RowState }
type Action =
  | { type: 'toggleScore'; row: number }
  | { type: 'toggleNote'; row: number }
  | { type: 'expandScore' | 'closeScore' | 'expandNotes' | 'closeNotes' }

const RowsContext = React.createContext<[State, Dispatch<Action>]>([
  {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  (action: Action) => {},
])

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'toggleScore':
      return produce(state, (draft) => {
        draft[action.row].score = !draft[action.row].score
      })
    case 'expandScore':
      return mapValues<RowState, RowState>(({ note }) => ({
        score: true,
        note,
      }))(state)
    case 'closeScore':
      return mapValues<RowState, RowState>(({ note }) => ({
        score: false,
        note,
      }))(state)
    case 'toggleNote':
      return produce(state, (draft) => {
        draft[action.row].note = !draft[action.row].note
      })
    case 'expandNotes':
      return mapValues<RowState, RowState>(({ score }) => ({
        score,
        note: true,
      }))(state)
    case 'closeNotes':
      return mapValues<RowState, RowState>(({ score }) => ({
        score,
        note: false,
      }))(state)
  }
}

export function useRowsContext(
  numberOfRows: number
): [State, Dispatch<Action>] {
  return useReducer(
    reducer,
    flow(
      range,
      map((row) => [row, { score: false, note: false }]),
      fromPairs
    )(0, numberOfRows)
  )
}

export default RowsContext
