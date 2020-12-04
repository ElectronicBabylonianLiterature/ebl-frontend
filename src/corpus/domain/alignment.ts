interface Variant {
  readonly value: string
  readonly language: string
  readonly isNormalized: boolean
}

export type AlignmentToken =
  | {
      readonly value: string
      readonly alignment: null
      readonly variant: null
      readonly isAlignable: false
    }
  | {
      readonly value: string
      readonly alignment: number | null
      readonly variant: Variant | null
      readonly isAlignable: true
    }

export interface ManuscriptAlignment {
  readonly alignment: AlignmentToken[]
  readonly omittedWords: readonly number[]
}

export type ChapterAlignment = readonly ManuscriptAlignment[][]
