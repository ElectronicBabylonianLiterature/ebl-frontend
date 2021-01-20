import _ from 'lodash'
import { Token } from 'transliteration/domain/token'
import {
  isAkkadianWord,
  isAnyWord,
  isSignToken,
  isWord,
} from 'transliteration/domain/type-guards'
import { createAlignmentToken, ManuscriptAlignment } from './alignment'
import produce, { immerable } from 'immer'

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

export function createManuscriptLine(
  config: Partial<ManuscriptLine>
): ManuscriptLine {
  return new ManuscriptLine(
    config.manuscriptId ?? 0,
    config.labels ?? [],
    config.number ?? '',
    config.atf ?? '',
    config.atfTokens ?? [],
    config.omittedWords ?? []
  )
}

type TokenWithIndex = Token & {
  originalIndex: number
}

function createIndexMap(atfTokens: readonly Token[]): number[] {
  return atfTokens.reduce<number[]>((acc, current) => {
    const previousIndex = _.last(acc) ?? -1
    return isAnyWord(current)
      ? [...acc, previousIndex + 1]
      : [...acc, previousIndex]
  }, [])
}

function createReverseIndexMap(
  atfTokens: readonly Token[],
  length: number
): number[] {
  return _.reduceRight<Token, number[]>(
    atfTokens,
    (acc, current) => {
      const previousIndex = _.first(acc) ?? length
      return isAnyWord(current)
        ? [previousIndex - 1, ...acc]
        : [previousIndex, ...acc]
    },
    []
  )
}

function stripReconstruction(
  reconstructionTokens: readonly Token[]
): TokenWithIndex[] {
  return reconstructionTokens.reduce<TokenWithIndex[]>(
    (acc, current, index) => {
      return isAnyWord(current)
        ? [...acc, { ...current, originalIndex: index }]
        : acc
    },
    []
  )
}

export class LineVariant {
  readonly [immerable] = true

  constructor(
    readonly reconstruction: string,
    readonly reconstructionTokens: ReadonlyArray<Token>,
    readonly manuscripts: ReadonlyArray<ManuscriptLine>
  ) {}

  get alignment(): ManuscriptAlignment[] {
    const reconstruction = stripReconstruction(this.reconstructionTokens)

    return this.manuscripts.map((manuscript) => {
      const indexMap = manuscript.endsWithLacuna
        ? createIndexMap(manuscript.atfTokens)
        : createReverseIndexMap(manuscript.atfTokens, reconstruction.length)
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

export function createVariant(config: Partial<LineVariant>): LineVariant {
  return new LineVariant(
    config.reconstruction ?? '',
    config.reconstructionTokens ?? [],
    config.manuscripts ?? []
  )
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
