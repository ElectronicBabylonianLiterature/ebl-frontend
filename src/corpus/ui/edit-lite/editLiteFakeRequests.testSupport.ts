import _ from 'lodash'
import { LineMoveDto } from 'corpus/application/edit-lite/ChapterEditSource'
import { LemmaWordQuery } from 'corpus/application/edit-lite/lineLemmatization'
import { ApiError } from 'http/ApiClient'

type Check = (value: unknown) => boolean
type Shape = Readonly<Record<string, Check>>

export interface TokenDto {
  readonly value: string
}

export interface AlignmentTokenDto extends TokenDto {
  readonly alignment?: number | null
  readonly variant?: string
  readonly type?: 'Word' | 'AkkadianWord'
  readonly language?: string
}

export interface ManuscriptAlignmentDto {
  readonly alignment: readonly AlignmentTokenDto[]
  readonly omittedWords: readonly number[]
}

export interface LemmaTokenDto extends TokenDto {
  readonly uniqueLemma?: readonly string[]
}

export interface VariantLemmatizationDto {
  readonly reconstruction: readonly LemmaTokenDto[]
  readonly manuscripts: readonly (readonly LemmaTokenDto[])[]
}

export const invalidRequestMessage = 'Request data failed validation'
export const maximumLemmaWords = 200
export function rejectRequest(message: string, status: number): never {
  throw new ApiError(message, { description: message }, status)
}

export function isPosition(value: unknown): boolean {
  return Number.isInteger(value) && Number(value) >= 0
}

function isListOf(check: Check): Check {
  return (value) => Array.isArray(value) && value.every(check)
}

function hasShape(shape: Shape, required: readonly string[]): Check {
  return (value) =>
    _.isPlainObject(value) &&
    required.every((field) => field in Object(value)) &&
    Object.entries(Object(value)).every(
      ([field, fieldValue]) => shape[field]?.(fieldValue) === true,
    )
}

const isAlignmentToken = hasShape(
  {
    value: _.isString,
    alignment: (value) => value === null || isPosition(value),
    variant: _.isString,
    type: _.isString,
    language: _.isString,
  },
  ['value'],
)
const isAlignmentBody = hasShape(
  {
    alignment: isListOf(
      isListOf(
        hasShape(
          {
            alignment: isListOf(isAlignmentToken),
            omittedWords: isListOf(isPosition),
          },
          ['alignment', 'omittedWords'],
        ),
      ),
    ),
  },
  ['alignment'],
)
const isLemmaToken = hasShape(
  { value: _.isString, uniqueLemma: isListOf(_.isString) },
  ['value'],
)
const isLemmatizationBody = hasShape(
  {
    lemmatization: isListOf(
      hasShape(
        {
          reconstruction: isListOf(isLemmaToken),
          manuscripts: isListOf(isListOf(isLemmaToken)),
        },
        ['reconstruction', 'manuscripts'],
      ),
    ),
  },
  ['lemmatization'],
)

const isLemmaWord = hasShape({ word: _.isString, isNormalized: _.isBoolean }, [
  'word',
  'isNormalized',
])
const isLemmaWordsBody = hasShape(
  {
    words: (value) =>
      Array.isArray(value) &&
      value.every(isLemmaWord) &&
      _.inRange(value.length, 1, maximumLemmaWords + 1),
  },
  ['words'],
)
const isMoveBody = hasShape({ from: isPosition, to: isPosition }, [
  'from',
  'to',
])

function parseBody<Dto>(body: unknown, isValid: Check): Dto {
  return isValid(body)
    ? (body as Dto)
    : rejectRequest(invalidRequestMessage, 400)
}

export function parseAlignmentBody(body: unknown): ManuscriptAlignmentDto[][] {
  return parseBody<{ alignment: ManuscriptAlignmentDto[][] }>(
    body,
    isAlignmentBody,
  ).alignment
}

export function parseLemmatizationBody(
  body: unknown,
): VariantLemmatizationDto[] {
  return parseBody<{ lemmatization: VariantLemmatizationDto[] }>(
    body,
    isLemmatizationBody,
  ).lemmatization
}

export function parseLemmaWordsBody(body: unknown): LemmaWordQuery[] {
  return parseBody<{ words: LemmaWordQuery[] }>(body, isLemmaWordsBody).words
}

export function parseMoveBody(body: unknown): LineMoveDto {
  return parseBody<LineMoveDto>(body, isMoveBody)
}
