import produce from 'immer'
import React, { Dispatch, useReducer } from 'react'
import flow from 'lodash/fp/flow'
import range from 'lodash/fp/range'
import map from 'lodash/fp/map'
import fromPairs from 'lodash/fp/fromPairs'
import mapValues from 'lodash/fp/mapValues'

type State = { readonly [key: number]: boolean }
type Action =
  | { type: 'toggleRow'; row: number }
  | { type: 'expandAll' | 'closeAll' }

const RowsContext = React.createContext<[State, Dispatch<Action>]>([
  {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  (action: Action) => {},
])

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'toggleRow':
      return produce(state, (draft) => {
        draft[action.row] = !draft[action.row]
      })
    case 'expandAll':
      return mapValues(() => true)(state)
    case 'closeAll':
      return mapValues(() => false)(state)
  }
}

export function useRowsContext(
  numberOfRows: number
): [State, Dispatch<Action>] {
  return useReducer(
    reducer,
    flow(
      range,
      map((row) => [row, false]),
      fromPairs
    )(0, numberOfRows)
  )
}

export default RowsContext
