import _ from 'lodash'
import { produce, castDraft } from 'immer'
import { LineVariant } from 'corpus/domain/line'
import {
  LemmatizationToken,
  UniqueLemma,
} from 'transliteration/domain/Lemmatization'

export type LineLemmatization = [
  readonly LemmatizationToken[],
  readonly LemmatizationToken[][],
]

export type ChapterLemmatization = readonly LineLemmatization[][]

export function setReconstructionLemma(
  [reconstruction, manuscripts]: LineLemmatization,
  variant: LineVariant,
  index: number,
  uniqueLemma: UniqueLemma,
): LineLemmatization {
  return [
    produce(reconstruction, (draft) => {
      draft[index] = castDraft(draft[index].setUniqueLemma(uniqueLemma))
    }),
    produce(manuscripts, (draft) => {
      return draft.map((manuscript, manuscriptIndex) =>
        manuscript.map((lemmatizationToken, tokenIndex) => {
          const token =
            variant.manuscripts[manuscriptIndex].atfTokens[tokenIndex]
          return token.lemmatizable &&
            token.alignment === index &&
            (_.isEmpty(lemmatizationToken.uniqueLemma) ||
              lemmatizationToken.suggested)
            ? castDraft(lemmatizationToken.setUniqueLemma(uniqueLemma, true))
            : lemmatizationToken
        }),
      )
    }),
  ]
}

export function setManuscriptLemma(
  [reconstruction, manuscripts]: LineLemmatization,
  manuscriptIndex: number,
  index: number,
  uniqueLemma: UniqueLemma,
): LineLemmatization {
  return [
    reconstruction,
    produce(manuscripts, (draft) => {
      draft[manuscriptIndex][index] = castDraft(
        draft[manuscriptIndex][index].setUniqueLemma(uniqueLemma),
      )
    }),
  ]
}
