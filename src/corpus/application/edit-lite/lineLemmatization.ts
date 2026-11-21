import _ from 'lodash'
import { LineLemmatization } from 'corpus/domain/lemmatization'
import { Line, LineVariant } from 'corpus/domain/line'
import Word from 'dictionary/domain/Word'
import Lemma from 'transliteration/domain/Lemma'
import {
  LemmatizationToken,
  UniqueLemma,
} from 'transliteration/domain/Lemmatization'
import { AnyWord, Token } from 'transliteration/domain/token'

export interface LemmaWordQuery {
  readonly word: string
  readonly isNormalized: boolean
}

export interface LemmaSuggestionsDto extends LemmaWordQuery {
  readonly lemmas: readonly (readonly Word[])[]
}

export interface LineLemmaSource {
  findSuggestions(
    words: readonly LemmaWordQuery[],
  ): Promise<readonly LemmaSuggestionsDto[]>
  findWords(ids: string[]): Promise<readonly Word[]>
}

interface LemmaData {
  readonly suggestions: ReadonlyMap<string, readonly UniqueLemma[]>
  readonly words: ReadonlyMap<string, Word>
}

export const maximumWordsPerSuggestionRequest = 200

export function wordNotFoundMessage(id: string): string {
  return `The dictionary has no word with the id "${id}".`
}

function toQueryKey({ word, isNormalized }: LemmaWordQuery): string {
  return `${isNormalized} ${word}`
}

function toQuery(token: AnyWord): LemmaWordQuery {
  return { word: token.cleanValue, isNormalized: token.normalized }
}

function needsSuggestions(token: Token): token is AnyWord {
  return token.lemmatizable === true && _.isEmpty(token.uniqueLemma)
}

function listTokens(variant: LineVariant): Token[] {
  return [
    ...variant.reconstructionTokens,
    ...variant.manuscripts.flatMap((manuscript) => manuscript.atfTokens),
  ]
}

function listQueries(line: Line): LemmaWordQuery[] {
  return _.uniqBy(
    line.variants
      .flatMap((variant) => variant.reconstructionTokens)
      .filter(needsSuggestions)
      .map(toQuery),
    toQueryKey,
  )
}

function listLemmaIds(line: Line): string[] {
  return _.uniq(
    line.variants
      .flatMap(listTokens)
      .flatMap((token) => (token.lemmatizable ? token.uniqueLemma : [])),
  )
}

async function findSuggestions(
  source: LineLemmaSource,
  queries: readonly LemmaWordQuery[],
): Promise<LemmaData['suggestions']> {
  const answers = await Promise.all(
    _.chunk(queries, maximumWordsPerSuggestionRequest).map((words) =>
      source.findSuggestions(words),
    ),
  )
  return new Map(
    answers
      .flat()
      .map((answer) => [
        toQueryKey(answer),
        answer.lemmas.map((lemma) => lemma.map((word) => new Lemma(word))),
      ]),
  )
}

async function findWords(
  source: LineLemmaSource,
  ids: string[],
): Promise<LemmaData['words']> {
  const words = ids.length > 0 ? await source.findWords(ids) : []
  return new Map(words.map((word) => [word._id, word]))
}

function createLemma(words: LemmaData['words'], id: string): Lemma {
  const word = words.get(id)
  if (word === undefined) {
    throw new Error(wordNotFoundMessage(id))
  }
  return new Lemma(word)
}

function findTokenSuggestions(
  token: Token,
  suggestions: LemmaData['suggestions'],
): readonly UniqueLemma[] {
  return needsSuggestions(token)
    ? (suggestions.get(toQueryKey(toQuery(token))) ?? [])
    : []
}

function lemmatizeToken(
  token: Token,
  words: LemmaData['words'],
  suggestions: readonly UniqueLemma[],
): LemmatizationToken {
  return token.lemmatizable
    ? new LemmatizationToken(
        token.value,
        true,
        token.uniqueLemma.map((id) => createLemma(words, id)),
        suggestions,
      )
    : new LemmatizationToken(token.value, false)
}

function lemmatizeVariant(
  variant: LineVariant,
  { words, suggestions }: LemmaData,
): LineLemmatization {
  return [
    variant.reconstructionTokens.map((token) =>
      lemmatizeToken(
        token,
        words,
        findTokenSuggestions(token, suggestions),
      ).applySuggestion(),
    ),
    variant.manuscripts.map((manuscript) =>
      manuscript.atfTokens.map((token) => lemmatizeToken(token, words, [])),
    ),
  ]
}

export async function createLineLemmatization(
  line: Line,
  source: LineLemmaSource,
): Promise<LineLemmatization[]> {
  const [suggestions, words] = await Promise.all([
    findSuggestions(source, listQueries(line)),
    findWords(source, listLemmaIds(line)),
  ])
  return line.variants.map((variant) =>
    lemmatizeVariant(variant, { suggestions, words }),
  )
}
