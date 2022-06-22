import React, { useContext } from 'react'
import DictionaryWord from 'dictionary/domain/Word'

export type LemmaMap = Map<string, DictionaryWord | null>

interface LineLemmas {
  lemmaMap: LemmaMap
  lemmaSetter: React.Dispatch<React.SetStateAction<LemmaMap>>
}

export const LineLemmasContext = React.createContext<LineLemmas | null>(null)

export function useLineLemmasContext(): LineLemmas {
  const lineLemmas = useContext(LineLemmasContext)
  if (lineLemmas === null) {
    throw new Error(
      'useLineLemmasContext must be inside LineLemmasContext.Provider'
    )
  } else {
    return lineLemmas
  }
}
