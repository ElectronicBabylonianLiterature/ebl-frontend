import produce from 'immer'
import React, { Dispatch } from 'react'
import _ from 'lodash'

type State = { readonly [key: number]: boolean }
type Action =
  | { type: 'toggleRow'; row: number }
  | { type: 'expandAll' | 'closeAll' }

const ChapterViewContext = React.createContext<[State, Dispatch<Action>]>([
  {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  (action: Action) => {},
])

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'toggleRow':
      return produce(state, (draft) => {
        draft[action.row] = !draft[action.row]
      })
    case 'expandAll':
      return _.mapValues(state, () => true)
    case 'closeAll':
      return _.mapValues(state, () => false)
  }
}

export default ChapterViewContext
