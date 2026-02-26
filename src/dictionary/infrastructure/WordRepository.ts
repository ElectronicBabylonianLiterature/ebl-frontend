import ApiClient from 'http/ApiClient'
import Word from 'dictionary/domain/Word'
import Promise from 'bluebird'

class WordRepository {
  private readonly apiClient

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient
  }

  find(id: string): Promise<Word> {
    return this.apiClient.fetchJson(`/words/${encodeURIComponent(id)}`, false)
  }

  findAll(lemmas: readonly string[]): Promise<readonly Word[]> {
    return this.apiClient.fetchJson(
      `/words?lemmas=${encodeURIComponent(lemmas.join(','))}`,
      false,
    )
  }

  search(query: string): Promise<Word[]> {
    return this.apiClient.fetchJson(
      `/words?query=${encodeURIComponent(query)}`,
      false,
    )
  }

  searchLemma(lemma: string): Promise<readonly Word[]> {
    return this.apiClient.fetchJson(
      `/words?lemma=${encodeURIComponent(lemma)}`,
      false,
    )
  }

  listAllWords(): Promise<string[]> {
    return this.apiClient.fetchJson(`/words/all`, false)
  }

  update(word: Word): Promise<Word> {
    return this.apiClient.postJson(
      `/words/${encodeURIComponent(word._id)}`,
      word,
    )
  }

  createProperNoun(lemma: string, posTag: string): Promise<Word> {
    return this.apiClient.postJson(`/words/create-proper-noun`, {
      lemma,
      posTag,
    })
  }
}

export default WordRepository
