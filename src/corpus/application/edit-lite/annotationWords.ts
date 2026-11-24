import { Line, LineVariant } from 'corpus/domain/line'
import { Token } from 'transliteration/domain/token'
import { isAnyWord } from 'transliteration/domain/type-guards'

export interface AnnotationWord {
  readonly variantIndex: number
  readonly manuscriptIndex: number | null
  readonly tokenIndex: number
}

type TokenFilter = (token: Token) => boolean

export function isAlignableToken(token: Token): boolean {
  return isAnyWord(token) && token.alignable
}

export function isLemmatizableToken(token: Token): boolean {
  return token.lemmatizable === true
}

function listRowWords(
  tokens: readonly Token[],
  variantIndex: number,
  manuscriptIndex: number | null,
  isIncluded: TokenFilter,
): AnnotationWord[] {
  return tokens.flatMap((token, tokenIndex) =>
    isIncluded(token) ? [{ variantIndex, manuscriptIndex, tokenIndex }] : [],
  )
}

function listManuscriptWords(
  variant: LineVariant,
  variantIndex: number,
  isIncluded: TokenFilter,
): AnnotationWord[] {
  return variant.manuscripts.flatMap((manuscript, manuscriptIndex) =>
    listRowWords(
      manuscript.atfTokens,
      variantIndex,
      manuscriptIndex,
      isIncluded,
    ),
  )
}

export function listAlignableWords(line: Line): AnnotationWord[] {
  return line.variants.flatMap((variant, variantIndex) =>
    listManuscriptWords(variant, variantIndex, isAlignableToken),
  )
}

export function listLemmatizableWords(line: Line): AnnotationWord[] {
  return line.variants.flatMap((variant, variantIndex) => [
    ...listRowWords(
      variant.reconstructionTokens,
      variantIndex,
      null,
      isLemmatizableToken,
    ),
    ...listManuscriptWords(variant, variantIndex, isLemmatizableToken),
  ])
}

export function isSameWord(
  first: AnnotationWord,
  second: AnnotationWord,
): boolean {
  return (
    first.variantIndex === second.variantIndex &&
    first.manuscriptIndex === second.manuscriptIndex &&
    first.tokenIndex === second.tokenIndex
  )
}

export function findWordPosition(
  words: readonly AnnotationWord[],
  word: AnnotationWord,
): number | null {
  const position = words.findIndex((candidate) => isSameWord(candidate, word))
  return position < 0 ? null : position
}

export function findNextWord(
  wordCount: number,
  position: number,
): number | null {
  return position + 1 < wordCount ? position + 1 : null
}

export function findPreviousWord(position: number): number {
  return Math.max(position - 1, 0)
}

export function findLineToken(line: Line, word: AnnotationWord): Token {
  const variant = line.variants[word.variantIndex]
  const tokens =
    word.manuscriptIndex === null
      ? variant.reconstructionTokens
      : variant.manuscripts[word.manuscriptIndex].atfTokens
  return tokens[word.tokenIndex]
}

export function listSimilarWords(
  line: Line,
  words: readonly AnnotationWord[],
  word: AnnotationWord,
): AnnotationWord[] {
  const cleanValue = findLineToken(line, word).cleanValue
  return words.filter(
    (candidate) => findLineToken(line, candidate).cleanValue === cleanValue,
  )
}
