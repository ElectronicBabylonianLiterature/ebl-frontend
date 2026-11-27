import {
  LemmaSuggestionsDto,
  LemmaWordQuery,
} from 'corpus/application/edit-lite/lineLemmatization'
import {
  parseLemmaWordsBody,
  parseProperNounBody,
} from 'corpus/ui/edit-lite/editLiteFakeRequests.testSupport'
import { buildDictionaryWord } from 'corpus/ui/edit-lite/editLiteTokens.testSupport'
import Word from 'dictionary/domain/Word'

export interface FakeLemmaSuggestion extends LemmaWordQuery {
  readonly lemmas: readonly (readonly string[])[]
}

export const lemmaBatchPath = '/lemmas/batch'
export const properNounPath = '/words/create-proper-noun'

export function buildWordsPath(ids: readonly string[]): string {
  return `/words?lemmas=${encodeURIComponent(ids.join(','))}`
}

export default class EditLiteFakeDictionary {
  private words: readonly Word[]

  constructor(
    words: readonly Word[],
    private readonly suggestions: readonly FakeLemmaSuggestion[] = [],
  ) {
    this.words = words
  }

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
    if (method === 'POST' && pathname === properNounPath) {
      return new Promise((resolve) => resolve(this.createProperNoun(body)))
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

  private createProperNoun(body: unknown): Word {
    const { lemma, namedEntityTags } = parseProperNounBody(body)
    const word: Word = {
      ...buildDictionaryWord(lemma, namedEntityTags[0]),
      pos: [],
      namedEntityTags: [...namedEntityTags],
    }
    this.words = [...this.words, word]
    return word
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
