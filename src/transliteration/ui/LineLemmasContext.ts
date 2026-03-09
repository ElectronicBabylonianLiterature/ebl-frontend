import React, { useContext } from 'react'
import DictionaryWord from 'dictionary/domain/Word'
import { EmptyLineToken, OneOfLineToken } from 'transliteration/ui/line-tokens'
import _ from 'lodash'

export type LemmaMap = Map<string, DictionaryWord | null>

export function createLemmaMap(lemmas: readonly string[]): LemmaMap {
  return new Map(lemmas.map((lemmaKey) => [lemmaKey, null]))
}

export function updateLemmaMapKeys(
  lemmaMap: LemmaMap,
  manuscriptLines: ReadonlyArray<ReadonlyArray<OneOfLineToken>>,
): void {
  manuscriptLines
    .flatMap((tokens) => tokens.flatMap((token) => token.uniqueLemma))
    .filter(
      (lemmaKey) =>
        !(
          _.isNil(lemmaKey) ||
          lemmaKey === EmptyLineToken.cleanValue ||
          lemmaMap.has(lemmaKey)
        ),
    )
    .forEach((lemmaKey) => lemmaMap.set(lemmaKey, null))
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
      'useLineLemmasContext must be inside LineLemmasContext.Provider',
    )
  } else {
    return lineLemmas
  }
}
