import WordService from 'dictionary/application/WordService'
import React, { useContext } from 'react'

export const DictionaryContext = React.createContext<WordService | null>(null)

export function useDictionary(): WordService {
  const dictionary = useContext(DictionaryContext)
  if (dictionary === null) {
    throw new Error('useDictionary must be inside DictionaryContext.Provider')
  } else {
    return dictionary
  }
}
