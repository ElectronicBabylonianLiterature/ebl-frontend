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
  | { type: 'expandScores' | 'closeScores' | 'expandNotes' | 'closeNotes' }

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
    case 'expandScores':
      return mapValues<RowState, RowState>(({ note }) => ({
        score: true,
        note,
      }))(state)
    case 'closeScores':
      return mapValues<RowState, RowState>(({ note }) => ({
        score: false,
        note,
      }))(state)
    default:
      return state
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
