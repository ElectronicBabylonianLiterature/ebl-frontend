import DossierRecord from 'dossiers/domain/DossierRecord'
import Promise from 'bluebird'
import ApiClient from 'http/ApiClient'

export default class DossiersRepository {
  private readonly apiClient: ApiClient

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient
  }

  searchByIds(query: string): Promise<DossierRecord[]> {
    return this.apiClient
      .fetchJson(`/dossiers?${query}`, false)
      .then((result) => result.map((data) => new DossierRecord(data)))
  }
}
