import _ from 'lodash'
import { AnnotationWord } from 'corpus/application/edit-lite/annotationWords'
import {
  LineLemmatization,
  setManuscriptLemma,
  setReconstructionLemma,
} from 'corpus/domain/lemmatization'
import { Line } from 'corpus/domain/line'
import {
  LemmatizationToken,
  UniqueLemma,
} from 'transliteration/domain/Lemmatization'

type Lemmatization = readonly LineLemmatization[]

function withoutEmptySuggestion(token: LemmatizationToken): LemmatizationToken {
  return token.suggested && !token.hasLemma
    ? token.clearSuggestionFlag()
    : token
}

function mapVariant(
  lemmatization: Lemmatization,
  variantIndex: number,
  change: (variant: LineLemmatization) => LineLemmatization,
): LineLemmatization[] {
  return lemmatization.map((variant, index) =>
    index === variantIndex ? change(variant) : variant,
  )
}

function listLemmaIds(token: LemmatizationToken): string[] {
  return _.map(token.uniqueLemma, 'value')
}

function replaceToken(
  [reconstruction, manuscripts]: LineLemmatization,
  { manuscriptIndex, tokenIndex }: AnnotationWord,
  token: LemmatizationToken,
): LineLemmatization {
  const replace = (
    tokens: readonly LemmatizationToken[],
  ): LemmatizationToken[] =>
    tokens.map((current, index) => (index === tokenIndex ? token : current))
  return manuscriptIndex === null
    ? [replace(reconstruction), manuscripts]
    : [
        reconstruction,
        manuscripts.map((manuscript, index) =>
          index === manuscriptIndex ? replace(manuscript) : manuscript,
        ),
      ]
}

export function findLemmaToken(
  lemmatization: Lemmatization,
  { variantIndex, manuscriptIndex, tokenIndex }: AnnotationWord,
): LemmatizationToken {
  const [reconstruction, manuscripts] = lemmatization[variantIndex]
  return manuscriptIndex === null
    ? reconstruction[tokenIndex]
    : manuscripts[manuscriptIndex][tokenIndex]
}

export function isSameLemmaToken(
  first: LemmatizationToken,
  second: LemmatizationToken,
): boolean {
  return (
    first.suggested === second.suggested &&
    _.isEqual(listLemmaIds(first), listLemmaIds(second))
  )
}

export function setWordLemma(
  lemmatization: Lemmatization,
  line: Line,
  word: AnnotationWord,
  uniqueLemma: UniqueLemma,
): LineLemmatization[] {
  return mapVariant(lemmatization, word.variantIndex, (variant) => {
    if (word.manuscriptIndex !== null) {
      return setManuscriptLemma(
        variant,
        word.manuscriptIndex,
        word.tokenIndex,
        uniqueLemma,
      )
    }
    const [reconstruction, manuscripts] = setReconstructionLemma(
      variant,
      line.variants[word.variantIndex],
      word.tokenIndex,
      uniqueLemma,
    )
    return [
      reconstruction,
      manuscripts.map((manuscript) => manuscript.map(withoutEmptySuggestion)),
    ]
  })
}

function listPropagatedWords(
  lemmatization: Lemmatization,
  line: Line,
  word: AnnotationWord,
): AnnotationWord[] {
  const manuscripts =
    word.manuscriptIndex === null
      ? line.variants[word.variantIndex].manuscripts
      : []
  return manuscripts.flatMap((manuscript, manuscriptIndex) =>
    manuscript.atfTokens.flatMap((token, tokenIndex) => {
      const candidate = { ...word, manuscriptIndex, tokenIndex }
      return token.alignment === word.tokenIndex &&
        findLemmaToken(lemmatization, candidate).suggested
        ? [candidate]
        : []
    }),
  )
}

export function resetWordLemmas(
  lemmatization: Lemmatization,
  loaded: Lemmatization,
  line: Line,
  words: readonly AnnotationWord[],
): LineLemmatization[] {
  return words
    .flatMap((word) => [
      word,
      ...listPropagatedWords(lemmatization, line, word),
    ])
    .reduce<
      LineLemmatization[]
    >((current, word) => mapVariant(current, word.variantIndex, (variant) => replaceToken(variant, word, findLemmaToken(loaded, word))), [...lemmatization])
}

export function listChangedWords(
  lemmatization: Lemmatization,
  loaded: Lemmatization,
  words: readonly AnnotationWord[],
): AnnotationWord[] {
  return words.filter(
    (word) =>
      !isSameLemmaToken(
        findLemmaToken(lemmatization, word),
        findLemmaToken(loaded, word),
      ),
  )
}
