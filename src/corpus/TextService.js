export default class TextService {
  constructor (apiClient) {
    this.apiClient = apiClient
  }

  find (category, index) {
    return this.apiClient
      .fetchJson(`/texts/${encodeURIComponent(category)}.${encodeURIComponent(index)}`, true)
  }
}
