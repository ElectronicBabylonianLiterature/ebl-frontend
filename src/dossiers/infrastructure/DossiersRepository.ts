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

  searchSuggestions(
    query: string,
    filters?: {
      provenance?: string | null
      scriptPeriod?: string | null
      genre?: string | null
    },
  ): Promise<DossierRecordSuggestion[]> {
    const queryString = stringify({ q: query })
    const suggestionsPromise = this.apiClient
      .fetchJson<
        { id: string; description?: string }[]
      >(`/dossiers/suggestions?${queryString}`, false)
      .then((result) => result.map((data) => new DossierRecordSuggestion(data)))

    const hasFilters = filters && Object.values(filters).some((v) => v)
    if (!hasFilters) {
      return suggestionsPromise
    }

    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v),
    )
    return Promise.all([
      suggestionsPromise,
      this.fetchFilteredDossiers(cleanFilters),
    ]).then(([suggestions, filteredDossiers]) => {
      const filteredIds = new Set(filteredDossiers.map((d) => d.id))
      return suggestions.filter((s) => filteredIds.has(s.id))
    })
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
