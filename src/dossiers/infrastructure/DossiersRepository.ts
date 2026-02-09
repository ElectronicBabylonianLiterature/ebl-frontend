import DossierRecord, {
  DossierRecordDto,
  DossierRecordSuggestion,
} from 'dossiers/domain/DossierRecord'
import Promise from 'bluebird'
import ApiClient from 'http/ApiClient'
import { stringify } from 'query-string'

export default class DossiersRepository {
  private readonly apiClient: ApiClient

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient
  }

  fetchAllDossiers(): Promise<DossierRecord[]> {
    return this.apiClient
      .fetchJson<DossierRecordDto[] | { dossiers: DossierRecordDto[] }>(
        '/dossiers',
        false,
      )
      .then((result) => {
        const dossiers = 'dossiers' in result ? result.dossiers : result
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

  searchSuggestions(query: string): Promise<DossierRecordSuggestion[]> {
    const queryString = stringify({ q: query })
    return this.apiClient
      .fetchJson<
        { id: string; description?: string }[]
      >(`/dossiers/suggestions?${queryString}`, false)
      .then((result) => result.map((data) => new DossierRecordSuggestion(data)))
  }

  fetchFilteredDossiers(filters: {
    provenance?: string
    scriptPeriod?: string
    genre?: string
  }): Promise<DossierRecord[]> {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v),
    )

    if (Object.keys(cleanFilters).length === 0) {
      return this.fetchAllDossiers()
    }

    const queryString = stringify(cleanFilters)
    return this.apiClient
      .fetchJson<DossierRecordDto[] | { dossiers: DossierRecordDto[] }>(
        `/dossiers/filter?${queryString}`,
        false,
      )
      .then((result) => {
        const dossiers = 'dossiers' in result ? result.dossiers : result
        return Array.isArray(dossiers)
          ? dossiers.map((data) => new DossierRecord(data))
          : []
      })
      .catch((error) => {
        console.warn('Failed to fetch filtered dossiers:', error.message)
        return this.fetchAllDossiers()
      })
  }
}
