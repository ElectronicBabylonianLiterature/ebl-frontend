import produce, { immerable, Draft, castDraft } from 'immer'

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

export class ChapterAlignment {
  readonly [immerable] = true
  readonly lines: readonly ManuscriptAlignment[][]

  constructor(lines: readonly ManuscriptAlignment[][]) {
    this.lines = lines
  }

  getAlignment(
    lineIndex: number,
    manuscriptIndex: number
  ): readonly AlignmentToken[] {
    return this.lines[lineIndex][manuscriptIndex].alignment
  }

  setAlignment(
    lineIndex: number,
    manuscriptIndex: number,
    alignment: readonly AlignmentToken[]
  ): ChapterAlignment {
    return produce(this, (draft: Draft<ChapterAlignment>) => {
      draft.lines[lineIndex][manuscriptIndex].alignment = castDraft(alignment)
    })
  }
}
