import produce from 'immer'
import React, { Dispatch, useReducer } from 'react'
import flow from 'lodash/fp/flow'
import range from 'lodash/fp/range'
import map from 'lodash/fp/map'
import fromPairs from 'lodash/fp/fromPairs'
import mapValues from 'lodash/fp/mapValues'

export interface RowState {
  readonly score: boolean
  readonly notes: boolean
  readonly parallels: boolean
  readonly oldLineNumbers: boolean
  readonly meter: boolean
}

type State = { readonly [key: number]: RowState }

type ToggleAction = {
  type: 'toggle'
  target: 'score' | 'notes' | 'parallels'
  row: number
}

type Action =
  | ToggleAction
  | {
      type: 'expand' | 'close'
      target: keyof RowState
    }

const RowsContext = React.createContext<[State, Dispatch<Action>]>([
  {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  (action: Action) => {},
])

function toggle(state: State, row: number, key: keyof RowState): State {
  return produce(state, (draft) => {
    draft[row][key] = !state[row][key]
  })
}

function setAll(state: State, key: keyof RowState, value: boolean): State {
  return mapValues<RowState, RowState>((rowState) => ({
    ...rowState,
    [key]: value,
  }))(state)
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'toggle':
      return toggle(state, action.row, action.target)
    case 'expand':
      return setAll(state, action.target, true)
    case 'close':
      return setAll(state, action.target, false)
  }
}

export function useRowsContext(
  numberOfRows: number
): [State, Dispatch<Action>] {
  return useReducer(
    reducer,
    flow(
      range,
      map((row) => [
        row,
        { score: false, notes: false, oldLineNumbers: false },
      ]),
      fromPairs
    )(0, numberOfRows)
  )
}

export default RowsContext
