import produce, { immerable } from 'immer'
import _ from 'lodash'
import { Token } from 'transliteration/domain/token'
import {
  isAkkadianWord,
  isAnyWord,
  isSignToken,
  isWord,
} from 'transliteration/domain/type-guards'
import { createAlignmentToken, ManuscriptAlignment } from './alignment'

export class ManuscriptLine {
  readonly [immerable] = true

  constructor(
    readonly manuscriptId: number,
    readonly labels: readonly string[],
    readonly number: string,
    readonly atf: string,
    readonly atfTokens: readonly Token[],
    readonly omittedWords: readonly number[]
  ) {}

  get endsWithLacuna(): boolean {
    const lastSign = _(this.atfTokens)
      .filter(isAnyWord)
      .flatMap((word) => (isWord(word) ? word.parts : word))
      .filter((token) => isAkkadianWord(token) || isSignToken(token))
      .last()

    return ['UnclearSign', 'UnknownNumberOfSigns'].includes(
      lastSign?.type ?? ''
    )
  }
}

export const createManuscriptLine: (
  data: Partial<ManuscriptLine>
) => ManuscriptLine = produce(
  (draft: Partial<ManuscriptLine>): ManuscriptLine =>
    new ManuscriptLine(
      draft.manuscriptId ?? 0,
      draft.labels ?? [],
      draft.number ?? '',
      draft.atf ?? '',
      draft.atfTokens ?? [],
      draft.omittedWords ?? []
    )
)

type TokenWithIndex = Token & {
  originalIndex: number
}

export class LineVariant {
  readonly [immerable] = true

  constructor(
    readonly reconstruction: string,
    readonly reconstructionTokens: ReadonlyArray<Token>,
    readonly manuscripts: ReadonlyArray<ManuscriptLine>
  ) {}

  get alignment(): ManuscriptAlignment[] {
    const reconstruction = this.reconstructionTokens.reduce<TokenWithIndex[]>(
      (acc, current, index) => {
        return isAnyWord(current)
          ? [...acc, { ...current, originalIndex: index }]
          : acc
      },
      []
    )

    return this.manuscripts.map((manuscript) => {
      const indexMap = manuscript.endsWithLacuna
        ? manuscript.atfTokens.reduce<number[]>((acc, current) => {
            const previousIndex = _.last(acc) ?? -1
            return isAnyWord(current)
              ? [...acc, previousIndex + 1]
              : [...acc, previousIndex]
          }, [])
        : _.reduceRight<Token, number[]>(
            manuscript.atfTokens,
            (acc, current) => {
              const previousIndex = _.first(acc) ?? reconstruction.length
              return isAnyWord(current)
                ? [previousIndex - 1, ...acc]
                : [previousIndex, ...acc]
            },
            []
          )
      return {
        alignment: manuscript.atfTokens.map((token, index) => {
          const alignment = createAlignmentToken(token)
          const reconstructedWord: TokenWithIndex | undefined =
            reconstruction[indexMap[index]]
          return alignment.isAlignable &&
            _.isNil(alignment.alignment) &&
            reconstructedWord &&
            isAnyWord(reconstructedWord)
            ? {
                ...alignment,
                alignment: reconstructedWord.originalIndex,
                suggested: true,
              }
            : alignment
        }),
        omittedWords: manuscript.omittedWords,
      }
    })
  }
}

export interface Line {
  readonly number: string
  readonly variants: ReadonlyArray<LineVariant>
  readonly isSecondLineOfParallelism: boolean
  readonly isBeginningOfSection: boolean
}

export const createLine: (config: Partial<Line>) => Line = produce(
  (draft): Line => ({
    number: '',
    variants: [],
    isSecondLineOfParallelism: false,
    isBeginningOfSection: false,
    ...draft,
  })
)

export const createVariant: (
  config: Partial<LineVariant>
) => LineVariant = produce(
  (draft): LineVariant =>
    new LineVariant(
      draft.reconstruction ?? '',
      draft.reconstructionTokens ?? [],
      draft.manuscripts ?? []
    )
)
