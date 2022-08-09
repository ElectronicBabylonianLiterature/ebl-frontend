import React, { useContext } from 'react'
import DictionaryWord from 'dictionary/domain/Word'
import { LineToken } from './line-tokens'

export type LemmaMap = Map<string, DictionaryWord | null>

export function createLemmaMap(lemmas: readonly string[]): LemmaMap {
  return new Map(lemmas.map((lemmaKey) => [lemmaKey, null]))
}

export function updateLemmaMapKeys(
  lemmaMap: LemmaMap,
  manuscriptLines: LineToken[][]
): void {
  for (const lemmaKey of manuscriptLines.flatMap((tokens) =>
    tokens.flatMap((token) => token.token.uniqueLemma)
  )) {
    if (lemmaKey && !lemmaMap.get(lemmaKey)) {
      lemmaMap.set(lemmaKey, null)
    }
  }
}

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
