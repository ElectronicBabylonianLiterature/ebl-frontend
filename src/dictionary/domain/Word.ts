export interface OraccWord {
  readonly lemma: string
  readonly guideWord: string
}

export interface AkkadischeGlossareUndIndex {
  readonly mainWord: string
  readonly note: string
  readonly reference: string
  readonly AfO: string
  readonly agiID: string
}

export interface Form {
  readonly attested: boolean
  readonly lemma: readonly string[]
  readonly notes: readonly string[]
}

export interface Vowels {
  readonly value: readonly string[]
  readonly notes: readonly string[]
}

export interface Entry {
  readonly meaning: string
  readonly vowels: readonly Vowels[]
}

export interface AmplifiedMeaning extends Entry {
  readonly key: string
  readonly entries: readonly Entry[]
}

export interface Derived {
  readonly lemma: readonly string[]
  readonly homonym: string
  readonly notes: readonly string[]
}

export interface Logogram {
  readonly logogram: readonly string[]
  readonly notes: readonly string[]
}

export default interface Word {
  readonly _id: string
  readonly attested: boolean
  readonly lemma: readonly string[]
  readonly legacyLemma: string
  readonly homonym: string
  readonly meaning: string
  readonly pos: readonly string[]
  readonly forms: readonly Form[]
  readonly amplifiedMeanings: readonly AmplifiedMeaning[]
  readonly logograms: readonly Logogram[]
  readonly derived: readonly Derived[][]
  readonly derivedFrom: Derived
  readonly source?: string
  readonly roots?: readonly string[]
  readonly guideWord: string
  readonly arabicGuideWord: string
  readonly cdaAddenda?: string
  readonly origin: string
  readonly oraccWords: readonly OraccWord[]
  readonly akkadischeGlossareUndIndices: readonly AkkadischeGlossareUndIndex[]
}
