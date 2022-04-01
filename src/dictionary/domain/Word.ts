export interface OraccWord {
  lemma: string
  guideWord: string
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
  readonly lemma: readonly string[]
  readonly homonym: string
  readonly pos: readonly string[]
  readonly guideWord: string
  readonly arabicGuideWord: string
  readonly cdaAddenda: string
  readonly origin: string
  readonly oraccWords: readonly OraccWord[]
  readonly akkadischeGlossareUndIndices: readonly AkkadischeGlossareUndIndex[]
  readonly [key: string]: any
}
