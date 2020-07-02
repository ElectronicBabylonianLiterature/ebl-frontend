export interface OraccWord {
  lemma: string
  guideWord: string
}

export default interface Word {
  readonly _id: string
  readonly lemma: readonly string[]
  readonly homonym: string
  readonly guideWord: string
  readonly oraccWords: readonly OraccWord[]
  readonly [key: string]: any
}
