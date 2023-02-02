import Promise from 'bluebird'
import Word from 'dictionary/domain/Word'
import WordRepository from 'dictionary/infrastructure/WordRepository'
import _ from 'lodash'
import { stringify } from 'query-string'

export interface WordQuery {
  word?: string
  meaning?: string
  root?: string
  vowelClass?: string
}

class WordService {
  private readonly wordRepository: WordRepository

  constructor(wordRepository: WordRepository) {
    this.wordRepository = wordRepository
  }

  find(id: string): Promise<Word> {
    return this.wordRepository.find(id)
  }

  findAll(ids: string[]): Promise<readonly Word[]> {
    return this.wordRepository.findAll(ids)
  }

  search(query: WordQuery): Promise<Word[]> {
    return this.wordRepository.search(
      stringify(query, { skipEmptyString: true })
    )
  }

  searchLemma(lemma: string): Promise<readonly Word[]> {
    return _.isEmpty(lemma)
      ? Promise.resolve([])
      : this.wordRepository.searchLemma(lemma)
  }

  update(word: Word): Promise<Word> {
    return this.wordRepository.update(word)
  }
}

export default WordService
