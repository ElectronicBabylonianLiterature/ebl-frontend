import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import Promise from 'bluebird'

function createEntry(cslData) {
  return new BibliographyEntry(cslData)
}

export default class BibliographyRepository {
  private readonly apiClient

  constructor(apiClient) {
    this.apiClient = apiClient
  }

  find(id): Promise<BibliographyEntry> {
    return this.apiClient
      .fetchJson(`/bibliography/${encodeURIComponent(id)}`, true)
      .then(createEntry)
  }

  search(query): Promise<BibliographyEntry[]> {
    return this.apiClient
      .fetchJson(`/bibliography?query=${encodeURIComponent(query)}`, true)
      .then((result) => result.map(createEntry))
  }

  update(entry): Promise<BibliographyEntry> {
    return this.apiClient
      .postJson(`/bibliography/${encodeURIComponent(entry.id)}`, entry.toJson())
      .then(createEntry)
  }

  create(entry): Promise<BibliographyEntry> {
    return this.apiClient
      .postJson(`/bibliography`, entry.toJson())
      .then(createEntry)
  }
}
