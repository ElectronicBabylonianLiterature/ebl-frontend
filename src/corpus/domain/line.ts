import _ from 'lodash'
import { Token } from 'transliteration/domain/token'
import { isWord } from 'transliteration/domain/type-guards'
import { ManuscriptAlignment, AlignmentToken } from 'corpus/domain/alignment'
import { immerable } from 'immer'
import {
  isAlignmentRelevant,
  ManuscriptLine,
  TokenWithIndex,
} from 'corpus/domain/manuscript-line'

export {
  ManuscriptLine,
  createManuscriptLine,
} from 'corpus/domain/manuscript-line'

function stripReconstruction(
  reconstructionTokens: readonly Token[],
): TokenWithIndex[] {
  return reconstructionTokens.reduce<TokenWithIndex[]>(
    (acc, current, index) => {
      return isAlignmentRelevant(current)
        ? [...acc, { ...current, originalIndex: index }]
        : acc
    },
    [],
  )
}

export class LineVariant {
  readonly [immerable] = true

  constructor(
    readonly reconstruction: string,
    readonly reconstructionTokens: ReadonlyArray<Token>,
    readonly manuscripts: ReadonlyArray<ManuscriptLine>,
    readonly intertext: string,
    readonly note: string,
  ) {}

  get alignment(): ManuscriptAlignment[] {
    const indexAlignment = this.createIndexAlignment()
    return this.createPrefixAlignment(indexAlignment)
  }

  private createIndexAlignment(): ManuscriptAlignment[] {
    const reconstruction = stripReconstruction(this.reconstructionTokens)
    return this.manuscripts.map((manuscript) => {
      return {
        alignment: manuscript.alignTo(reconstruction),
        omittedWords: manuscript.omittedWords,
      }
    })
  }

  private createPrefixAlignment(
    baseAlignment: readonly ManuscriptAlignment[],
  ): ManuscriptAlignment[] {
    return baseAlignment.map((alignment, index) => ({
      ...alignment,
      alignment: this.getPrefixSuggestions(
        alignment.alignment,
        baseAlignment,
        index,
      ),
    }))
  }

  getPrefixSuggestions(
    alignment: readonly AlignmentToken[],
    baseAlignment: readonly ManuscriptAlignment[],
    index: number,
  ): AlignmentToken[] {
    return alignment.map((token, tokenIndex) => {
      const matches = this.getMatches(index, tokenIndex, baseAlignment)
      const matchingWords = new Set(matches.flatMap(_.identity))
      const alignment = matchingWords.values().next().value ?? null

      return matches.length > 1 &&
        matchingWords.size === 1 &&
        token.isAlignable &&
        (token.suggested || _.isNil(token.alignment))
        ? {
            ...token,
            alignment:
              _.isNil(token.alignment) || alignment === token.alignment
                ? alignment
                : null,
            suggested: _.isNil(token.alignment)
              ? true
              : alignment === token.alignment,
          }
        : token
    })
  }

  getMatches(
    index: number,
    tokenIndex: number,
    baseAlignment: readonly ManuscriptAlignment[],
  ): number[][] {
    const atfToken = this.manuscripts[index].atfTokens[tokenIndex]
    return isWord(atfToken)
      ? this.manuscripts
          .map((manuscript, manuscriptIndex) =>
            index === manuscriptIndex
              ? []
              : (manuscript
                  .findMatchingWords(atfToken)
                  .map(
                    (tokenIndex) =>
                      baseAlignment[manuscriptIndex].alignment[tokenIndex]
                        .alignment,
                  )
                  .filter(_.negate(_.isNil)) as number[]),
          )
          .filter((matches) => matches.length === 1)
      : []
  }
}

export function createVariant(config: Partial<LineVariant>): LineVariant {
  return new LineVariant(
    config.reconstruction ?? '',
    config.reconstructionTokens ?? [],
    config.manuscripts ?? [],
    config.intertext ?? '',
    config.note ?? '',
  )
}

export enum EditStatus {
  CLEAN,
  EDITED,
  DELETED,
  NEW,
}

export interface Line {
  readonly number: string
  readonly variants: ReadonlyArray<LineVariant>
  readonly isSecondLineOfParallelism: boolean
  readonly isBeginningOfSection: boolean
  readonly translation: string
  readonly status: EditStatus
}

export function createLine(config: Partial<Line>): Line {
  return {
    number: '',
    variants: [],
    isSecondLineOfParallelism: false,
    isBeginningOfSection: false,
    translation: '',
    status: EditStatus.CLEAN,
    ...config,
  }
}
