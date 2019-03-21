import _ from 'lodash'

function mapPos ({ pos, ...word }) {
  return {
    ...word,
    pos: _.isArray(pos)
      ? pos
      : pos ? [pos] : []
  }
}
class WordRepository {
  constructor (apiClient) {
    this.apiClient = apiClient
  }

  find (id) {
    return this.apiClient
      .fetchJson(`/words/${encodeURIComponent(id)}`, true)
      .then(mapPos)
  }

  search (query) {
    return this.apiClient
      .fetchJson(`/words?query=${encodeURIComponent(query)}`, true)
      .then(words => words.map(mapPos))
  }

  searchLemma (lemma) {
    return this.apiClient
      .fetchJson(`/words?lemma=${encodeURIComponent(lemma)}`, true)
      .then(words => words.map(mapPos))
  }

  update (word) {
    return this.apiClient.postJson(
      `/words/${encodeURIComponent(word._id)}`,
      word
    ).then(mapPos)
  }
}

export default WordRepository
