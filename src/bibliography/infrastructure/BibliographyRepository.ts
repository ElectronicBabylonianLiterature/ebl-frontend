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
      .fetchJson<
        Record<string, unknown>
      >(`/bibliography/${encodeURIComponent(id)}`, false)
      .then(createEntry)
  }

  findMany(ids: readonly string[]): Promise<readonly BibliographyEntry[]> {
    return this.apiClient
      .fetchJson<
        Record<string, unknown>[]
      >(`/bibliography/list?${stringify({ ids }, { arrayFormat: 'comma' })}`, false)
      .then((result) => result.map(createEntry))
  }

  search(query: string): Promise<BibliographyEntry[]> {
    return this.apiClient
      .fetchJson<
        Record<string, unknown>[]
      >(`/bibliography?query=${encodeURIComponent(query)}`, false)
      .then((result) => result.map(createEntry))
  }

  update(entry: BibliographyEntry): Promise<BibliographyEntry> {
    return this.apiClient
      .postJson<
        Record<string, unknown>
      >(`/bibliography/${encodeURIComponent(entry.id)}`, entry.toCslData())
      .then(createEntry)
  }

  create(entry: BibliographyEntry): Promise<BibliographyEntry> {
    return this.apiClient
      .postJson<Record<string, unknown>>(`/bibliography`, entry.toCslData())
      .then(createEntry)
  }
  listAllBibliography(): Promise<string[]> {
    return this.apiClient.fetchJson<string[]>(`/bibliography/all`, false)
  }
}
