import _ from 'lodash'
import {
  createManuscriptLine,
  createVariant,
  Line,
  ManuscriptLine,
} from 'corpus/domain/line'
import {
  annotateLine,
  createWordToken,
} from 'corpus/ui/edit-lite/editLiteTokens.testSupport'
import {
  AlignmentTokenDto,
  LemmaTokenDto,
  ManuscriptAlignmentDto,
  parseAlignmentBody,
  parseLemmatizationBody,
  rejectRequest,
  TokenDto,
} from 'corpus/ui/edit-lite/editLiteFakeRequests.testSupport'
import { Token } from 'transliteration/domain/token'

export const duplicateAlignmentMessage =
  'Invalid alignment: two words of a manuscript line are aligned to the same word.'
export const notAlignableMessage =
  'Invalid alignment: the token is not alignable.'
export const notLemmatizableMessage =
  'Invalid lemmatization: the token is not lemmatizable.'

export function countMismatchMessage(
  kind: string,
  expected: number,
  actual: number,
): string {
  return `Invalid number of ${kind}. Got ${actual}, expected ${expected}.`
}

export function valueMismatchMessage(expected: string, actual: string): string {
  return `Invalid token value: expected ${expected}, got ${actual}.`
}

function checkCount(kind: string, expected: number, actual: number): void {
  if (expected !== actual) {
    rejectRequest(countMismatchMessage(kind, expected, actual), 422)
  }
}

function checkTokens(
  tokens: readonly Token[],
  dtos: readonly TokenDto[],
): void {
  checkCount('tokens', tokens.length, dtos.length)
  tokens.forEach((token, index) => {
    if (token.value !== dtos[index].value) {
      rejectRequest(valueMismatchMessage(token.value, dtos[index].value), 422)
    }
  })
}

function alignToken(token: Token, dto: AlignmentTokenDto): Token {
  const alignment = dto.alignment ?? null
  const isAlignable = 'alignable' in token && token.alignable
  if (!isAlignable && alignment !== null) {
    rejectRequest(notAlignableMessage, 422)
  }
  return isAlignable
    ? ({
        ...token,
        alignment,
        variant: dto.variant
          ? createWordToken(dto.variant, dto.type ?? 'Word', {
              language: dto.language,
            })
          : null,
      } as Token)
    : token
}

function alignManuscriptLine(
  manuscriptLine: ManuscriptLine,
  dto: ManuscriptAlignmentDto,
): ManuscriptLine {
  const alignments = dto.alignment.flatMap((token) => token.alignment ?? [])
  checkTokens(manuscriptLine.atfTokens, dto.alignment)
  if (_.uniq(alignments).length !== alignments.length) {
    rejectRequest(duplicateAlignmentMessage, 422)
  }
  return createManuscriptLine({
    ...manuscriptLine,
    omittedWords: dto.omittedWords,
    atfTokens: manuscriptLine.atfTokens.map((token, index) =>
      alignToken(token, dto.alignment[index]),
    ),
  })
}

function lemmatizeTokens(
  tokens: readonly Token[],
  dtos: readonly LemmaTokenDto[],
): Token[] {
  checkTokens(tokens, dtos)
  return tokens.map((token, index) => {
    const uniqueLemma = dtos[index].uniqueLemma ?? []
    if (!token.lemmatizable && uniqueLemma.length > 0) {
      rejectRequest(notLemmatizableMessage, 422)
    }
    return token.lemmatizable ? ({ ...token, uniqueLemma } as Token) : token
  })
}

type Annotator = (line: Line) => Line
type Variant = Line['variants'][number]

function createAnnotator<Dto>(
  dtos: readonly Dto[],
  countManuscripts: (dto: Dto) => number,
  annotate: (variant: Variant, dto: Dto) => Partial<Variant>,
): Annotator {
  return (line) => {
    const annotatedLine = annotateLine(line)
    checkCount('variants', annotatedLine.variants.length, dtos.length)
    return {
      ...annotatedLine,
      variants: annotatedLine.variants.map((variant, index) => {
        checkCount(
          'manuscript lines',
          variant.manuscripts.length,
          countManuscripts(dtos[index]),
        )
        return createVariant({ ...variant, ...annotate(variant, dtos[index]) })
      }),
    }
  }
}

export function createAligner(body: unknown): Annotator {
  return createAnnotator(
    parseAlignmentBody(body),
    (dto) => dto.length,
    (variant, dto) => ({
      manuscripts: variant.manuscripts.map((manuscriptLine, index) =>
        alignManuscriptLine(manuscriptLine, dto[index]),
      ),
    }),
  )
}

export function createLemmatizer(body: unknown): Annotator {
  return createAnnotator(
    parseLemmatizationBody(body),
    (dto) => dto.manuscripts.length,
    (variant, dto) => ({
      reconstructionTokens: lemmatizeTokens(
        variant.reconstructionTokens,
        dto.reconstruction,
      ),
      manuscripts: variant.manuscripts.map((manuscriptLine, index) =>
        createManuscriptLine({
          ...manuscriptLine,
          atfTokens: lemmatizeTokens(
            manuscriptLine.atfTokens,
            dto.manuscripts[index],
          ),
        }),
      ),
    }),
  )
}

export function keepTokens(previous: Line | undefined, edited: Line): Line {
  return {
    ...edited,
    variants: edited.variants.map((variant, variantIndex) => {
      const previousVariant = previous?.variants[variantIndex]
      return createVariant({
        ...variant,
        reconstructionTokens:
          previousVariant?.reconstruction === variant.reconstruction
            ? previousVariant.reconstructionTokens
            : [],
        manuscripts: variant.manuscripts.map((manuscriptLine, index) => {
          const previousLine = previousVariant?.manuscripts[index]
          return previousLine?.atf === manuscriptLine.atf
            ? createManuscriptLine({
                ...manuscriptLine,
                atfTokens: previousLine.atfTokens,
              })
            : manuscriptLine
        }),
      })
    }),
  }
}

export function toAnnotatedLineDto(line: Line): Record<string, unknown> {
  const annotatedLine = annotateLine(line)
  return {
    ..._.omit(annotatedLine, 'status'),
    variants: annotatedLine.variants.map((variant) => ({
      ...variant,
      manuscripts: variant.manuscripts.map((manuscript) => ({ ...manuscript })),
    })),
  }
}
