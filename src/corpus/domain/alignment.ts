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
  ): ManuscriptAlignment {
    return this.lines[lineIndex][manuscriptIndex]
  }

  setAlignment(
    lineIndex: number,
    manuscriptIndex: number,
    alignment: ManuscriptAlignment
  ): ChapterAlignment {
    return produce(this, (draft: Draft<ChapterAlignment>) => {
      draft.lines[lineIndex][manuscriptIndex] = castDraft(alignment)
    })
  }
}

export function createAlignmentToken(token: Token): AlignmentToken {
  return token.lemmatizable
    ? {
        value: token.value,
        alignment: token.alignment,
        variant: token.variant && {
          value: token.variant.value,
          language: token.variant.language,
          isNormalized: token.variant.normalized,
        },
        isAlignable: true,
      }
    : {
        value: token.value,
        alignment: null,
        variant: null,
        isAlignable: false,
      }
}
