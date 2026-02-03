import { produce } from 'immer'
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
  readonly ipa: boolean
}

type State = { readonly [key: number]: RowState }
export type RowsContextService = [State, Dispatch<Action>]

type ToggleAction = {
  type: 'toggle'
  target: 'score' | 'notes' | 'parallels'
  row: number
}

export type Action =
  | ToggleAction
  | {
      type: 'expand' | 'close'
      target: keyof RowState
    }

const RowsContext = React.createContext<RowsContextService>([
  {},
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
  numberOfRows: number,
  score?: boolean,
  notes?: boolean,
  parallels?: boolean,
  oldLineNumbers?: boolean,
): RowsContextService {
  score = score ?? false
  notes = notes ?? false
  parallels = parallels ?? false
  oldLineNumbers = oldLineNumbers ?? false
  return useReducer(
    reducer,
    flow(
      range,
      map((row) => [
        row,
        {
          score: score,
          notes: notes,
          parallels: parallels,
          oldLineNumbers: oldLineNumbers,
        },
      ]),
      fromPairs,
    )(0, numberOfRows),
  )
}

export default RowsContext
