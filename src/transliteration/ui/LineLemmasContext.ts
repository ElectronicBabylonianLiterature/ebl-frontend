import React, { useContext } from 'react'
import DictionaryWord from 'dictionary/domain/Word'

interface LineLemmas {
  lemmaKeys: (readonly string[])[]
  lemmas: DictionaryWord[][]
  lemmasSetter: React.Dispatch<React.SetStateAction<DictionaryWord[][]>>
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
