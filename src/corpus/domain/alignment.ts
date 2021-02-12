import produce, { castDraft, Draft, immerable } from 'immer'
import { Token } from 'transliteration/domain/token'

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
      readonly suggested: false
    }
  | {
      readonly value: string
      readonly alignment: number | null
      readonly variant: Variant | null
      readonly isAlignable: true
      readonly suggested: boolean
    }

export interface ManuscriptAlignment {
  readonly alignment: AlignmentToken[]
  readonly omittedWords: readonly number[]
}

export class ChapterAlignment {
  readonly [immerable] = true
  readonly lines: readonly ManuscriptAlignment[][][]

  constructor(lines: readonly ManuscriptAlignment[][][]) {
    this.lines = lines
  }

  getAlignment(
    lineIndex: number,
    variantIndex: number,
    manuscriptIndex: number
  ): ManuscriptAlignment {
    return this.lines[lineIndex][variantIndex][manuscriptIndex]
  }

  setAlignment(
    lineIndex: number,
    variantIndex: number,
    manuscriptIndex: number,
    alignment: ManuscriptAlignment
  ): ChapterAlignment {
    return produce(this, (draft: Draft<ChapterAlignment>) => {
      draft.lines[lineIndex][variantIndex][manuscriptIndex] = castDraft(
        alignment
      )
    })
  }
}

export function createAlignmentToken(token: Token): AlignmentToken {
  return 'variant' in token && token.alignable
    ? {
        value: token.value,
        alignment: token.alignment,
        variant: token.variant && {
          value: token.variant.value,
          language: token.variant.language,
          isNormalized: token.variant.normalized,
        },
        isAlignable: true,
        suggested: false,
      }
    : {
        value: token.value,
        alignment: null,
        variant: null,
        isAlignable: false,
        suggested: false,
      }
}
