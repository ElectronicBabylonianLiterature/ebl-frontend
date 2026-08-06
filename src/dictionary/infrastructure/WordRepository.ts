import ApiClient from 'http/ApiClient'
import Word from 'dictionary/domain/Word'

class WordRepository {
  private readonly apiClient

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient
  }

  find(id: string, signal?: AbortSignal): Promise<Word> {
    return this.apiClient.fetchJson(
      `/words/${encodeURIComponent(id)}`,
      false,
      signal,
    )
  }

  findAll(
    lemmas: readonly string[],
    signal?: AbortSignal,
  ): Promise<readonly Word[]> {
    return this.apiClient.fetchJson(
      `/words?lemmas=${encodeURIComponent(lemmas.join(','))}`,
      false,
      signal,
    )
  }

  search(query: string, signal?: AbortSignal): Promise<Word[]> {
    return this.apiClient.fetchJson(
      `/words?query=${encodeURIComponent(query)}`,
      false,
      signal,
    )
  }

  searchLemma(lemma: string, signal?: AbortSignal): Promise<readonly Word[]> {
    return this.apiClient.fetchJson(
      `/words?lemma=${encodeURIComponent(lemma)}`,
      false,
      signal,
    )
  }

  listAllWords(signal?: AbortSignal): Promise<string[]> {
    return this.apiClient.fetchJson(`/words/all`, false, signal)
  }

  update(word: Word): Promise<Word> {
    return this.apiClient.postJson(
      `/words/${encodeURIComponent(word._id)}`,
      word,
    )
  }

  createProperNoun(lemma: string, namedEntityTag: string): Promise<Word> {
    return this.apiClient.postJson(`/words/create-proper-noun`, {
      lemma,
      namedEntityTags: [namedEntityTag],
    })
  }
}

export default WordRepository
