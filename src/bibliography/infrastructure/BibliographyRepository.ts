import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import Promise from 'bluebird'
import ApiClient from 'http/ApiClient'

function createEntry(cslData) {
  return new BibliographyEntry(cslData)
}

export default class BibliographyRepository {
  private readonly apiClient: ApiClient

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient
  }

  find(id: string): Promise<BibliographyEntry> {
    return this.apiClient
      .fetchJson(`/bibliography/${encodeURIComponent(id)}`, true)
      .then(createEntry)
  }

  search(query: string): Promise<BibliographyEntry[]> {
    return this.apiClient
      .fetchJson(`/bibliography?query=${encodeURIComponent(query)}`, true)
      .then((result) => result.map(createEntry))
  }

  update(entry: BibliographyEntry): Promise<BibliographyEntry> {
    return this.apiClient
      .postJson(
        `/bibliography/${encodeURIComponent(entry.id)}`,
        entry.toCslData()
      )
      .then(createEntry)
  }

  create(entry: BibliographyEntry): Promise<BibliographyEntry> {
    return this.apiClient
      .postJson(`/bibliography`, entry.toCslData())
      .then(createEntry)
  }
}
