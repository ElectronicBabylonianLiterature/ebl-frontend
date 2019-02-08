import queryString from 'query-string'
import BibliographyEntry from './bibliographyEntry'

function createEntry (cslData) {
  return new BibliographyEntry(cslData)
}

export default class BibliographyRepository {
  constructor (apiClient) {
    this.apiClient = apiClient
  }

  find (id) {
    return this.apiClient
      .fetchJson(`/bibliography/${encodeURIComponent(id)}`, true)
      .then(createEntry)
  }

  search (author, year, title) {
    const query = { author, year, title }
    return this.apiClient
      .fetchJson(`/bibliography?${queryString.stringify(query)}`, true)
      .then(result => result.map(createEntry))
  }
}
