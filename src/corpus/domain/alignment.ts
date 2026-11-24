import { produce, castDraft, Draft, immerable } from 'immer'
import { Token } from 'transliteration/domain/token'
import { isAnyWord } from 'transliteration/domain/type-guards'

interface Variant {
  readonly value: string
  readonly type: string
  readonly language: string
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

export type LineAlignment = readonly ManuscriptAlignment[][]

export const setAlignmentToken = produce(
  (draft: Draft<ManuscriptAlignment>, index: number, token: AlignmentToken) => {
    draft.alignment[index] = castDraft(token)
  },
)

export const setOmittedWords = produce(
  (draft: Draft<ManuscriptAlignment>, value: number[]) => {
    draft.omittedWords = value
  },
)

export function setManuscriptAlignment(
  lineAlignment: LineAlignment,
  variantIndex: number,
  manuscriptIndex: number,
  alignment: ManuscriptAlignment,
): LineAlignment {
  return produce(lineAlignment, (draft: Draft<LineAlignment>) => {
    draft[variantIndex][manuscriptIndex] = castDraft(alignment)
  })
}

export function alignToken(
  token: AlignmentToken,
  reconstructionTokens: readonly Token[],
  alignment: number | null,
  variant: string,
): AlignmentToken {
  const reconstructionToken =
    alignment === null ? undefined : reconstructionTokens[alignment]
  return alignment !== null &&
    reconstructionToken !== undefined &&
    isAnyWord(reconstructionToken)
    ? {
        value: token.value,
        alignment,
        variant: variant
          ? {
              value: variant,
              type: reconstructionToken.type,
              language: reconstructionToken.language,
            }
          : null,
        isAlignable: true,
        suggested: false,
      }
    : {
        value: token.value,
        alignment: null,
        variant: null,
        isAlignable: true,
        suggested: false,
      }
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
    manuscriptIndex: number,
  ): ManuscriptAlignment {
    return this.lines[lineIndex][variantIndex][manuscriptIndex]
  }

  setAlignment(
    lineIndex: number,
    variantIndex: number,
    manuscriptIndex: number,
    alignment: ManuscriptAlignment,
  ): ChapterAlignment {
    return produce(this, (draft: Draft<ChapterAlignment>) => {
      draft.lines[lineIndex][variantIndex][manuscriptIndex] =
        castDraft(alignment)
    })
  }
}

export function createAlignmentToken(token: Token): AlignmentToken {
  return isAnyWord(token) && token.alignable
    ? {
        value: token.value,
        alignment: token.alignment,
        variant: token.variant && {
          value: token.variant.value,
          type: token.variant.type,
          language: token.variant.language,
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
