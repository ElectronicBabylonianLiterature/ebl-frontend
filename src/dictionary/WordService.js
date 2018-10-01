class WordService {
  constructor (auth, wordRepository) {
    this.auth = auth
    this.wordRepository = wordRepository
  }

  find (id) {
    return this.wordRepository.find(id)
  }

  search (query) {
    return this.wordRepository.search(query)
  }

  update (word) {
    return this.wordRepository.update(word)
  }

  isAllowedToRead () {
    return this.auth.isAllowedToReadWords()
  }

  isAllowedToWrite () {
    return this.auth.isAllowedToWriteWords()
  }
}

export default WordService
