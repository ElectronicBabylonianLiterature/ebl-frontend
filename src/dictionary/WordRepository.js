class WordRepository {
  constructor (apiClient) {
    this.apiClient = apiClient
  }

  find (id) {
    return this.apiClient.fetchJson(`/words/${encodeURIComponent(id)}`, true)
  }

  search (query) {
    return this.apiClient.fetchJson(`/words?query=${encodeURIComponent(query)}`, true)
  }

  update (word) {
    return this.apiClient.postJson(
      `/words/${encodeURIComponent(word._id)}`,
      word
    )
  }
}

export default WordRepository
