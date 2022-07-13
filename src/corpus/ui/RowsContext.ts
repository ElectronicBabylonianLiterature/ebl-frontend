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
  readonly parallels: boolean
  readonly meter: boolean
}

type State = { readonly [key: number]: RowState }

type Action =
  | {
      type: 'toggleScore' | 'toggleNote' | 'toggleParallels'
      row: number
    }
  | {
      type:
        | 'expandScore'
        | 'closeScore'
        | 'expandNotes'
        | 'closeNotes'
        | 'expandParallels'
        | 'closeParallels'
        | 'expandMeter'
        | 'closeMeter'
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
    case 'toggleScore':
      return toggle(state, action.row, 'score')
    case 'expandScore':
      return setAll(state, 'score', true)
    case 'closeScore':
      return setAll(state, 'score', false)
    case 'toggleNote':
      return toggle(state, action.row, 'note')
    case 'expandNotes':
      return setAll(state, 'note', true)
    case 'closeNotes':
      return setAll(state, 'note', false)
    case 'toggleParallels':
      return toggle(state, action.row, 'parallels')
    case 'expandParallels':
      return setAll(state, 'parallels', true)
    case 'closeParallels':
      return setAll(state, 'parallels', false)
    case 'expandMeter':
      return setAll(state, 'meter', true)
    case 'closeMeter':
      return setAll(state, 'meter', false)
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
