import DossierRecord from 'dossiers/domain/DossierRecord'
import Promise from 'bluebird'
import ApiClient from 'http/ApiClient'
import { stringify } from 'query-string'

export default class DossiersRepository {
  private readonly apiClient: ApiClient

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient
  }

  queryByIds(query: string[]): Promise<DossierRecord[]> {
    return this.apiClient
      .fetchJson(`/dossiers?${stringify({ ids: query })}`, false)
      .then((result) => result.map((data) => new DossierRecord(data)))
  }
}
