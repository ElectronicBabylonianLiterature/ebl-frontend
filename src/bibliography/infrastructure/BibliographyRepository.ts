import queryString from 'query-string'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'

function createEntry(cslData) {
  return new BibliographyEntry(cslData)
}

export default class BibliographyRepository {
  private readonly apiClient

  constructor(apiClient) {
    this.apiClient = apiClient
  }

  find(id) {
    return this.apiClient
      .fetchJson(`/bibliography/${encodeURIComponent(id)}`, true)
      .then(createEntry)
  }

  search(author, year, title) {
    const query = { author, year, title }
    return this.apiClient
      .fetchJson(`/bibliography?${queryString.stringify(query)}`, true)
      .then(result => result.map(createEntry))
  }

  update(entry) {
    return this.apiClient
      .postJson(`/bibliography/${encodeURIComponent(entry.id)}`, entry.toJson())
      .then(createEntry)
  }

  create(entry) {
    return this.apiClient
      .postJson(`/bibliography`, entry.toJson())
      .then(createEntry)
  }
}
