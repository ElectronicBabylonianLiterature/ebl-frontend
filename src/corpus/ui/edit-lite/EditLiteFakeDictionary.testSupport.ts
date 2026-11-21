import {
  LemmaSuggestionsDto,
  LemmaWordQuery,
} from 'corpus/application/edit-lite/lineLemmatization'
import { parseLemmaWordsBody } from 'corpus/ui/edit-lite/editLiteFakeRequests.testSupport'
import Word from 'dictionary/domain/Word'

export interface FakeLemmaSuggestion extends LemmaWordQuery {
  readonly lemmas: readonly (readonly string[])[]
}

export const lemmaBatchPath = '/lemmas/batch'

export function buildWordsPath(ids: readonly string[]): string {
  return `/words?lemmas=${encodeURIComponent(ids.join(','))}`
}

export default class EditLiteFakeDictionary {
  constructor(
    private readonly words: readonly Word[],
    private readonly suggestions: readonly FakeLemmaSuggestion[] = [],
  ) {}

  respond(
    method: 'GET' | 'POST',
    path: string,
    body: unknown,
  ): Promise<unknown> | null {
    const { pathname, searchParams } = new URL(path, 'http://localhost')
    const lemma = searchParams.get('lemma')
    const lemmas = searchParams.get('lemmas')
    if (method === 'POST' && pathname === lemmaBatchPath) {
      return new Promise((resolve) => resolve(this.findSuggestions(body)))
    }
    if (method === 'GET' && pathname === '/words' && lemmas !== null) {
      return Promise.resolve(this.findWords(lemmas.split(',')))
    }
    return method === 'GET' && pathname === '/words' && lemma !== null
      ? Promise.resolve(
          this.words.filter((word) => word.lemma.join(' ').startsWith(lemma)),
        )
      : null
  }

  private findWords(ids: readonly string[]): Word[] {
    return this.words.filter((word) => ids.includes(word._id))
  }

  private findSuggestions(body: unknown): LemmaSuggestionsDto[] {
    return parseLemmaWordsBody(body).map(({ word, isNormalized }) => ({
      word,
      isNormalized,
      lemmas: this.suggestions
        .filter(
          (suggestion) =>
            suggestion.word === word &&
            suggestion.isNormalized === isNormalized,
        )
        .flatMap((suggestion) => suggestion.lemmas)
        .map((ids) => this.findWords(ids)),
    }))
  }
}
