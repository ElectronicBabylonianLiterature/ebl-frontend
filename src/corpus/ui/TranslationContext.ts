import produce from 'immer'
import React, { Dispatch, useReducer } from 'react'

export const defaultLanguage = 'en'

type State = { readonly language: string }
type Action = { type: 'setLanguage'; language: string }

const TranslationContext = React.createContext<[State, Dispatch<Action>]>([
  { language: defaultLanguage },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  (action: Action) => {},
])

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'setLanguage':
      return produce(state, (draft) => {
        draft.language = action.language
      })
  }
}

export function useTranslationContext(
  language: string = defaultLanguage
): [State, Dispatch<Action>] {
  return useReducer(reducer, { language })
}

export default TranslationContext
