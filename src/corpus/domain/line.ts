import _ from 'lodash'
import { Token, ErasureType, Word } from 'transliteration/domain/token'
import {
  isAkkadianWord,
  isAnyWord,
  isSignToken,
  isWord,
  isNamedSign,
} from 'transliteration/domain/type-guards'
import {
  createAlignmentToken,
  ManuscriptAlignment,
  AlignmentToken,
} from './alignment'
import { immerable } from 'immer'
import {
  Segment,
  getPhoneticSegments,
} from 'akkadian/application/phonetics/segments'

function isLacuna(token: Token | undefined) {
  const lacunaTypes: readonly string[] = ['UnclearSign', 'UnknownNumberOfSigns']
  return lacunaTypes.includes(token?.type ?? '')
}

function isAlignmentRelevant(token: Token): boolean {
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
      .filter((token) => isAkkadianWord(token) || isSignToken(token))
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

type TokenWithIndex = Token & {
  originalIndex: number
}

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
      const alignment = matchingWords.values().next().value

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
