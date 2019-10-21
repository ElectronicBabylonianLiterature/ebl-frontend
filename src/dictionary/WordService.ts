class WordService {
  private readonly wordRepository

  constructor(wordRepository) {
    this.wordRepository = wordRepository
  }

  find(id) {
    return this.wordRepository.find(id)
  }

  search(query) {
    return this.wordRepository.search(query)
  }

  update(word) {
    return this.wordRepository.update(word)
  }
}

export default WordService
