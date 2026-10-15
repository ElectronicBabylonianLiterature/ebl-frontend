import Word from 'dictionary/domain/Word'
import WordRepository from 'dictionary/infrastructure/WordRepository'
import _ from 'lodash'
import { stringify } from 'query-string'

export interface WordQuery {
  word?: string
  meaning?: string
  root?: string
  vowelClass?: Array<string>
  origin?: Array<string>
}

class WordService {
  private readonly wordRepository: WordRepository

  constructor(wordRepository: WordRepository) {
    this.wordRepository = wordRepository
  }

  find(id: string, signal?: AbortSignal): Promise<Word> {
    return this.wordRepository.find(id, signal)
  }

  findAll(ids: string[], signal?: AbortSignal): Promise<readonly Word[]> {
    return this.wordRepository.findAll(ids, signal)
  }

  search(query: WordQuery, signal?: AbortSignal): Promise<Word[]> {
    return this.wordRepository.search(
      stringify(query, { skipEmptyString: true, arrayFormat: 'none' }),
      signal,
    )
  }

  searchLemma(lemma: string, signal?: AbortSignal): Promise<readonly Word[]> {
    return _.isEmpty(lemma)
      ? Promise.resolve([])
      : this.wordRepository.searchLemma(lemma, signal)
  }

  update(word: Word): Promise<Word> {
    return this.wordRepository.update(word)
  }

  createProperNoun(lemma: string, namedEntityTag: string): Promise<Word> {
    return this.wordRepository.createProperNoun(lemma, namedEntityTag)
  }

  listAllWords(signal?: AbortSignal): Promise<string[]> {
    return this.wordRepository.listAllWords(signal)
  }
}

export default WordService
