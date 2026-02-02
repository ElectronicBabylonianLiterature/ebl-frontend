import Label from './Label'
import { AnyWord } from 'transliteration/domain/token'
import DictionaryWord from 'dictionary/domain/Word'
import compareWord from 'dictionary/domain/compareWord'

export interface GlossaryToken {
  readonly label: Label
  readonly value: string
  readonly word: AnyWord
  readonly uniqueLemma: string
  readonly dictionaryWord: DictionaryWord | null
}

export type GlossaryEntry = readonly [string, readonly GlossaryToken[]]
export type GlossaryData = readonly GlossaryEntry[]

export function compareGlossaryEntries(
  [, [{ dictionaryWord: firstWord }]]: GlossaryEntry,
  [, [{ dictionaryWord: secondWord }]]: GlossaryEntry,
): number {
  if (firstWord && secondWord) {
    return compareWord(firstWord, secondWord)
  } else {
    throw new Error(
      'Either of the glossary entries is missing the dictionary word.',
    )
  }
}
