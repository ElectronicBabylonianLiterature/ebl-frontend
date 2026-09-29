import _ from 'lodash'
import { Token, ErasureType, Word } from 'transliteration/domain/token'
import {
  isAkkadianWord,
  isAnyWord,
  isSignToken,
  isWord,
  isNamedSign,
} from 'transliteration/domain/type-guards'
import { createAlignmentToken, AlignmentToken } from 'corpus/domain/alignment'
import { immerable } from 'immer'
import {
  Segment,
  getPhoneticSegments,
} from 'akkadian/application/phonetics/segments'

export type TokenWithIndex = Token & {
  originalIndex: number
}

function isLacuna(token: Token | undefined) {
  const lacunaTypes: readonly string[] = ['UnclearSign', 'UnknownNumberOfSigns']
  return lacunaTypes.includes(token?.type ?? '')
}

export function isAlignmentRelevant(token: Token): boolean {
  const erased: ErasureType = 'ERASED'
  return isAnyWord(token) && token.erasure !== erased
}

function isPrefixEqual(first: Word, second: Word): boolean {
  const signsToCompare = 2
  return (
    _([first, second])
      .map('parts')
      .invokeMap('filter', isSignToken)
      .unzip() as _.Collection<readonly Token[]>
  )
    .take(signsToCompare)
    .every(([signOfFirstWord, signOfSecondWord]) => {
      return (
        signOfFirstWord &&
        signOfSecondWord &&
        isNamedSign(signOfFirstWord) &&
        isNamedSign(signOfSecondWord) &&
        signOfFirstWord.name === signOfSecondWord.name
      )
    })
}

export class ManuscriptLine {
  readonly [immerable] = true

  constructor(
    readonly manuscriptId: number,
    readonly labels: readonly string[],
    readonly number: string,
    readonly atf: string,
    readonly atfTokens: readonly Token[],
    readonly omittedWords: readonly number[],
  ) {}

  get beginsWithLacuna(): boolean {
    return isLacuna(this.signs.first())
  }

  get endsWithLacuna(): boolean {
    return isLacuna(this.signs.last())
  }

  private get signs(): _.Collection<Token> {
    return _(this.atfTokens)
      .filter(isAlignmentRelevant)
      .flatMap((word) => (isWord(word) ? word.parts : word))
      .filter(
        (token): token is Token => isAkkadianWord(token) || isSignToken(token),
      ) as _.Collection<Token>
  }

  get phonetics(): Segment[] {
    const result = _(this.atfTokens)
      .filter((token) => isAkkadianWord(token))
      .map((token) => getPhoneticSegments(token.cleanValue, {}))
      .value()
    return result
  }

  alignTo(reconstruction: TokenWithIndex[]): AlignmentToken[] {
    const begingsAndEndsWithLacuna =
      this.beginsWithLacuna && this.endsWithLacuna
    const indexMap = this.createAlignmentIndexMap(reconstruction.length)
    const hasNoAlignments = this.atfTokens.every((token) =>
      _.isNil(token.alignment),
    )
    return this.atfTokens.map((token, index) => {
      const alignment = createAlignmentToken(token)
      const reconstructedWord: TokenWithIndex | undefined =
        reconstruction[indexMap[index]]
      return hasNoAlignments &&
        !begingsAndEndsWithLacuna &&
        alignment.isAlignable &&
        _.isNil(alignment.alignment) &&
        reconstructedWord &&
        isAnyWord(reconstructedWord)
        ? {
            ...alignment,
            alignment: reconstructedWord.originalIndex,
            suggested: true,
          }
        : alignment
    })
  }

  findMatchingWords(word: Word): number[] {
    return this.atfTokens.reduce<number[]>(
      (acc, token, index) =>
        isWord(token) && isPrefixEqual(word, token) ? [...acc, index] : acc,
      [],
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
      [],
    )
  }
}

export function createManuscriptLine(
  config: Partial<ManuscriptLine>,
): ManuscriptLine {
  return new ManuscriptLine(
    config.manuscriptId ?? 0,
    config.labels ?? [],
    config.number ?? '',
    config.atf ?? '',
    config.atfTokens ?? [],
    config.omittedWords ?? [],
  )
}
