import Promise from 'bluebird'
import Word from 'dictionary/domain/Word'
import WordRepository from 'dictionary/infrastructure/WordRepository'

class WordService {
  private readonly wordRepository

  constructor(wordRepository: WordRepository) {
    this.wordRepository = wordRepository
  }

  find(id: string): Promise<Word> {
    return this.wordRepository.find(id)
  }

  search(query: string): Promise<Word[]> {
    return this.wordRepository.search(query)
  }

  update(word: Word): Promise<Word> {
    return this.wordRepository.update(word)
  }
}

export default WordService
