import DossierRecord, { DossierRecordDto } from 'dossiers/domain/DossierRecord'
import Promise from 'bluebird'
import ApiClient from 'http/ApiClient'
import { stringify } from 'query-string'

export default class DossiersRepository {
  private readonly apiClient: ApiClient

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient
  }

  fetchAllDossiers(): Promise<DossierRecord[]> {
    // Fetch all dossiers from the main endpoint
    return this.apiClient
      .fetchJson('/dossiers', false)
      .then((result) => {
        const dossiers = result.dossiers || result
        return Array.isArray(dossiers)
          ? dossiers.map((data) => new DossierRecord(data))
          : []
      })
      .catch((error) => {
        console.warn('Failed to fetch dossiers:', error.message)
        return []
      })
  }

  queryByIds(query: string[]): Promise<DossierRecord[]> {
    const queryString = stringify({ ids: query }, { arrayFormat: 'bracket' })
    return this.apiClient
      .fetchJson<DossierRecordDto[]>(`/dossiers?${queryString}`, false)
      .then((result) => result.map((data) => new DossierRecord(data)))
  }

  searchDossier(query: string): Promise<DossierRecord[]> {
    const queryString = stringify({ q: query })
    return this.apiClient
      .fetchJson<DossierRecordDto[]>(`/dossiers/search?${queryString}`, false)
      .then((result) => result.map((data) => new DossierRecord(data)))
  }

  searchDossier(
    query: string,
    filters?: { provenance?: string; scriptPeriod?: string }
  ): Promise<DossierRecord[]> {
    const params = {
      query,
      ...(filters?.provenance && { provenance: filters.provenance }),
      ...(filters?.scriptPeriod && { scriptPeriod: filters.scriptPeriod }),
    }
    const queryString = stringify(params)
    return this.apiClient
      .fetchJson(`/dossiers/search?${queryString}`, false)
      .then((result) => {
        const dossiers = result.dossiers || result
        return Array.isArray(dossiers)
          ? dossiers.map((data) => new DossierRecord(data))
          : []
      })
  }

  fetchFilteredDossiers(filters: {
    provenance?: string
    scriptPeriod?: string
    genre?: string
  }): Promise<DossierRecord[]> {
    // Remove empty/null values
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v)
    )

    // If no filters, return all dossiers
    if (Object.keys(cleanFilters).length === 0) {
      return this.fetchAllDossiers()
    }

    // Build query string with filters
    const queryString = stringify(cleanFilters)
    return this.apiClient
      .fetchJson(`/dossiers/filter?${queryString}`, false)
      .then((result) => {
        const dossiers = result.dossiers || result
        return Array.isArray(dossiers)
          ? dossiers.map((data) => new DossierRecord(data))
          : []
      })
      .catch((error) => {
        console.warn('Failed to fetch filtered dossiers:', error.message)
        // Fallback to all dossiers if filtering not supported yet
        return this.fetchAllDossiers()
      })
  }
}
