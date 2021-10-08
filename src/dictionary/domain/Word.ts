export interface OraccWord {
  lemma: string
  guideWord: string
}

export interface AkkadischeGlossareUndIndex {
  mainWord: string
  note: string
  reference: string
  AfO: string
  agiID: string
}

export default interface Word {
  readonly _id: string
  readonly lemma: readonly string[]
  readonly homonym: string
  readonly pos: readonly string[]
  readonly guideWord: string
  readonly oraccWords: readonly OraccWord[]
  readonly akkadischeGlossareUndIndices: readonly AkkadischeGlossareUndIndex[]
  readonly [key: string]: any
}
