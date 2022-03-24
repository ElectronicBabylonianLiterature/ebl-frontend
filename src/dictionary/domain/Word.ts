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

export default interface Word {
  readonly _id: string
  readonly lemma: readonly string[]
  readonly homonym: string
  readonly pos: readonly string[]
  readonly guideWord: string
  readonly arabicGuideWord: string
  readonly cdaAddenda: string
  readonly oraccWords: readonly OraccWord[]
  readonly akkadischeGlossareUndIndices: readonly AkkadischeGlossareUndIndex[]
  readonly [key: string]: any
}
