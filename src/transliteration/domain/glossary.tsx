import Label from './Label'
import { Word as TransliterationWord } from 'transliteration/domain/token'
import DictionaryWord from 'dictionary/domain/Word'

export interface GlossaryToken {
  readonly label: Label
  readonly value: string
  readonly word: TransliterationWord
  readonly uniqueLemma: string
  readonly dictionaryWord?: DictionaryWord
}

export type GlossaryEntry = readonly [string, readonly GlossaryToken[]]
export type GlossaryData = readonly GlossaryEntry[]
