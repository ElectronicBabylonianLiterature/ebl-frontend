import { produce } from 'immer'
import React, { Dispatch, useReducer } from 'react'

export const defaultLanguage = 'en'

type State = { readonly language: string }
type Action = { type: 'setLanguage'; language: string }

export type TranslationContextService = [State, Dispatch<Action>]

const TranslationContext = React.createContext<TranslationContextService>([
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
  language: string = defaultLanguage,
): TranslationContextService {
  return useReducer(reducer, { language })
}

export default TranslationContext
