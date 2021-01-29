import ApiClient from 'http/ApiClient'
import Word from 'dictionary/domain/Word'
import Promise from 'bluebird'

class WordRepository {
  private readonly apiClient

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient
  }

  find(id: string): Promise<Word> {
    return this.apiClient.fetchJson(`/words/${encodeURIComponent(id)}`, true)
  }

  search(query: string): Promise<Word[]> {
    return this.apiClient.fetchJson(
      `/words?query=${encodeURIComponent(query)}`,
      true
    )
  }

  searchLemma(lemma: string): Promise<readonly Word[]> {
    return this.apiClient.fetchJson(
      `/words?lemma=${encodeURIComponent(lemma)}`,
      true
    )
  }

  update(word: Word): Promise<Word> {
    return this.apiClient.postJson(
      `/words/${encodeURIComponent(word._id)}`,
      word
    )
  }
}

export default WordRepository
