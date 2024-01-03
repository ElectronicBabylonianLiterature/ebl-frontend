import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import Promise from 'bluebird'
import ApiClient from 'http/ApiClient'
import { stringify } from 'query-string'

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
      .fetchJson(`/bibliography/${encodeURIComponent(id)}`, false)
      .then(createEntry)
  }

  findMany(ids: readonly string[]): Promise<readonly BibliographyEntry[]> {
    return this.apiClient
      .fetchJson(`/bibliography/list?${stringify(ids)}`, false)
      .then((result) => result.map(createEntry))
  }

  search(query: string): Promise<BibliographyEntry[]> {
    return this.apiClient
      .fetchJson(`/bibliography?query=${encodeURIComponent(query)}`, false)
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
  listAllBibliography(): Promise<string[]> {
    return this.apiClient.fetchJson(`/bibliography/all`, false)
  }
}
