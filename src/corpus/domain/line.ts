import _ from 'lodash'
import { Token, ErasureType } from 'transliteration/domain/token'
import {
  isAkkadianWord,
  isAnyWord,
  isSignToken,
  isWord,
} from 'transliteration/domain/type-guards'
import { createAlignmentToken, ManuscriptAlignment } from './alignment'
import produce, { immerable } from 'immer'

function isAlignmentRelevant(token: Token): boolean {
  const erased: ErasureType = 'ERASED'
  return isAnyWord(token) && token.erasure !== erased
}

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
      .filter(isAlignmentRelevant)
      .flatMap((word) => (isWord(word) ? word.parts : word))
      .filter((token) => isAkkadianWord(token) || isSignToken(token))
      .last()

    return ['UnclearSign', 'UnknownNumberOfSigns'].includes(
      lastSign?.type ?? ''
    )
  }

  createAlignmentIndexMap(targetLength: number): number[] {
    return this.endsWithLacuna
      ? this.createIndexMapFromLeft()
      : this.createIndexMapFromRight(targetLength)
  }

  private createIndexMapFromLeft(): number[] {
    return this.atfTokens.reduce<number[]>((acc, current) => {
      const previousIndex = _.last(acc) ?? -1
      return isAlignmentRelevant(current)
        ? [...acc, previousIndex + 1]
        : [...acc, previousIndex]
    }, [])
  }

  private createIndexMapFromRight(targetLength: number): number[] {
    return _.reduceRight<Token, number[]>(
      this.atfTokens,
      (acc, current) => {
        const previousIndex = _.first(acc) ?? targetLength
        return isAlignmentRelevant(current)
          ? [previousIndex - 1, ...acc]
          : [previousIndex, ...acc]
      },
      []
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

function stripReconstruction(
  reconstructionTokens: readonly Token[]
): TokenWithIndex[] {
  return reconstructionTokens.reduce<TokenWithIndex[]>(
    (acc, current, index) => {
      return isAlignmentRelevant(current)
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
      const indexMap = manuscript.createAlignmentIndexMap(reconstruction.length)
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
