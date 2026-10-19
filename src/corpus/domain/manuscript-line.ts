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
      const name = signName(signOfFirstWord)
      return name !== null && name === signName(signOfSecondWord)
    })
}

function signName(token: Token | undefined): string | null {
  return token && isNamedSign(token) ? token.name : null
}

type AlignableToken = Extract<AlignmentToken, { isAlignable: true }>

function isUnalignedAlignable(
  alignment: AlignmentToken,
): alignment is AlignableToken {
  return alignment.isAlignable && _.isNil(alignment.alignment)
}

function isReconstructedWord(
  token: TokenWithIndex | undefined,
): token is TokenWithIndex {
  return !!token && isAnyWord(token)
}

export interface ManuscriptLineProps {
  readonly manuscriptId: number
  readonly labels: readonly string[]
  readonly number: string
  readonly atf: string
  readonly atfTokens: readonly Token[]
  readonly omittedWords: readonly number[]
}

export class ManuscriptLine {
  readonly [immerable] = true

  readonly manuscriptId: number
  readonly labels: readonly string[]
  readonly number: string
  readonly atf: string
  readonly atfTokens: readonly Token[]
  readonly omittedWords: readonly number[]

  constructor({
    manuscriptId,
    labels,
    number,
    atf,
    atfTokens,
    omittedWords,
  }: ManuscriptLineProps) {
    this.manuscriptId = manuscriptId
    this.labels = labels
    this.number = number
    this.atf = atf
    this.atfTokens = atfTokens
    this.omittedWords = omittedWords
  }

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

  alignTo(reconstruction: TokenWithIndex[]): AlignmentToken[] {
    const mayBeSuggested = !(this.beginsWithLacuna && this.endsWithLacuna)
    const indexMap = this.createAlignmentIndexMap(reconstruction.length)
    const hasNoAlignments = this.atfTokens.every((token) =>
      _.isNil(token.alignment),
    )
    const canSuggest = hasNoAlignments && mayBeSuggested
    return this.atfTokens.map((token, index) => {
      const alignment = createAlignmentToken(token)
      const reconstructedWord: TokenWithIndex | undefined =
        reconstruction[indexMap[index]]
      return canSuggest &&
        isUnalignedAlignable(alignment) &&
        isReconstructedWord(reconstructedWord)
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
  return new ManuscriptLine({
    manuscriptId: config.manuscriptId ?? 0,
    labels: config.labels ?? [],
    number: config.number ?? '',
    atf: config.atf ?? '',
    atfTokens: config.atfTokens ?? [],
    omittedWords: config.omittedWords ?? [],
  })
}

export type TokenWithIndex = Token & {
  originalIndex: number
}
