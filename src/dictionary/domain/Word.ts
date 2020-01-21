export interface OraccWord {
  lemma: string
  guideWord: string
}

export default interface Word {
  readonly [key: string]: any
  readonly guideWord: string
  readonly oraccWords: readonly OraccWord[]
}
