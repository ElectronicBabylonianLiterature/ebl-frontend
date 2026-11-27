import _ from 'lodash'
import {
  AnnotationWord,
  pickWordToken,
} from 'corpus/application/edit-lite/annotationWords'
import { LineLemmatization } from 'corpus/domain/lemmatization'
import { Line } from 'corpus/domain/line'
import {
  LemmatizationToken,
  UniqueLemma,
} from 'transliteration/domain/Lemmatization'

type Lemmatization = readonly LineLemmatization[]

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
  word: AnnotationWord,
): LemmatizationToken {
  const [reconstruction, manuscripts] = lemmatization[word.variantIndex]
  return pickWordToken(reconstruction, manuscripts, word)
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

function listAlignedWords(
  line: Line,
  { variantIndex, manuscriptIndex, tokenIndex }: AnnotationWord,
): AnnotationWord[] {
  const manuscripts =
    manuscriptIndex === null ? line.variants[variantIndex].manuscripts : []
  return manuscripts.flatMap((manuscript, aligned) =>
    manuscript.atfTokens.flatMap((token, alignedToken) =>
      token.lemmatizable && token.alignment === tokenIndex
        ? [{ variantIndex, manuscriptIndex: aligned, tokenIndex: alignedToken }]
        : [],
    ),
  )
}

function listPropagatedWords(
  loaded: Lemmatization,
  line: Line,
  word: AnnotationWord,
): AnnotationWord[] {
  return listAlignedWords(line, word).filter(
    (aligned) => !findLemmaToken(loaded, aligned).hasLemma,
  )
}

function setToken(
  lemmatization: Lemmatization,
  word: AnnotationWord,
  token: LemmatizationToken,
): LineLemmatization[] {
  return mapVariant(lemmatization, word.variantIndex, (variant) =>
    replaceToken(variant, word, token),
  )
}

export function setWordLemma(
  lemmatization: Lemmatization,
  loaded: Lemmatization,
  line: Line,
  word: AnnotationWord,
  uniqueLemma: UniqueLemma,
): LineLemmatization[] {
  return [word, ...listPropagatedWords(loaded, line, word)].reduce<
    LineLemmatization[]
  >(
    (current, target) =>
      setToken(
        current,
        target,
        findLemmaToken(current, target).setUniqueLemma(uniqueLemma),
      ),
    [...lemmatization],
  )
}

export function resetWordLemmas(
  lemmatization: Lemmatization,
  loaded: Lemmatization,
  line: Line,
  words: readonly AnnotationWord[],
): LineLemmatization[] {
  return words
    .flatMap((word) => [word, ...listPropagatedWords(loaded, line, word)])
    .reduce<
      LineLemmatization[]
    >((current, word) => setToken(current, word, findLemmaToken(loaded, word)), [...lemmatization])
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
