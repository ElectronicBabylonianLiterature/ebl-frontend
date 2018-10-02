class FragmentRepository {
  constructor (apiClient) {
    this.apiClient = apiClient
  }

  statistics () {
    return this.apiClient.fetchJson(`/statistics`, false)
  }

  find (number) {
    return this.apiClient.fetchJson(`/fragments/${encodeURIComponent(number)}`, true)
  }

  random () {
    return this.apiClient.fetchJson(`/fragments?random=true`, true)
  }

  interesting () {
    return this.apiClient.fetchJson(`/fragments?interesting=true`, true)
  }

  searchNumber (number) {
    return this.apiClient.fetchJson(`/fragments?number=${encodeURIComponent(number)}`, true)
  }

  searchTransliteration (transliteration) {
    return this.apiClient.fetchJson(`/fragments?transliteration=${encodeURIComponent(transliteration)}`, true)
  }

  updateTransliteration (number, transliteration, notes) {
    const path = `/fragments/${encodeURIComponent(number)}`
    return this.apiClient.postJson(
      path,
      {
        transliteration: transliteration,
        notes: notes
      }
    )
  }
}

export default FragmentRepository
