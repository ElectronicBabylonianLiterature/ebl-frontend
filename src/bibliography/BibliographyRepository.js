import queryString from 'query-string'

export default class BibliographyRepository {
  constructor (apiClient) {
    this.apiClient = apiClient
  }

  find (id) {
    return this.apiClient.fetchJson(`/bibliography/${encodeURIComponent(id)}`, true)
  }

  search (author, year, title) {
    const query = { author, year, title }
    return this.apiClient.fetchJson(`/bibliography?${queryString.stringify(query)}`, true)
  }
}
