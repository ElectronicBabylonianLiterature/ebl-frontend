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
    return this.apiClient.fetchJson('/dossiers', false).then((result) => {
      const dossiers = result.dossiers || result
      return dossiers.map((data) => new DossierRecord(data))
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
        return dossiers.map((data) => new DossierRecord(data))
      })
  }
}
