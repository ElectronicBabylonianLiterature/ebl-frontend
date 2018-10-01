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

  allowedToRead () {
    const scope = this.auth.applicationScopes.readWords
    return this.auth.isAllowedTo(scope)
  }

  allowedToWrite () {
    const scope = this.auth.applicationScopes.writeWords
    return this.auth.isAllowedTo(scope)
  }
}

export default WordService
