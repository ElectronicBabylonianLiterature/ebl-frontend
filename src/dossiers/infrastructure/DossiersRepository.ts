import DossierRecord from 'dossiers/domain/DossierRecord'
import Promise from 'bluebird'
import ApiClient from 'http/ApiClient'
import { stringify } from 'query-string'
import { DossierQuery } from 'dossiers/domain/DossierQuery'

export default class DossiersRepository {
  private readonly apiClient: ApiClient

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient
  }

  queryByIds(query: string[]): Promise<DossierRecord[]> {
    const queryString = stringify({ ids: query }, { arrayFormat: 'bracket' })
    return this.apiClient
      .fetchJson(`/dossiers?${queryString}`, false)
      .then((result) => result.map((data) => new DossierRecord(data)))
  }

  async search(query: DossierQuery): Promise<DossierRecord[]> {
    const queryString = new URLSearchParams()
    
    if (query.searchText) queryString.append('searchText', query.searchText)
    if (query.period) queryString.append('period', query.period)
    if (query.periodModifier) queryString.append('periodModifier', query.periodModifier)
    if (query.dateFrom) queryString.append('dateFrom', query.dateFrom)
    if (query.dateTo) queryString.append('dateTo', query.dateTo)
    if (query.kings) queryString.append('kings', query.kings)
    if (query.limit) queryString.append('limit', query.limit.toString())
    if (query.page) queryString.append('page', query.page.toString())
    
    const response = await this.apiClient.fetchJson(`/dossiers/search?${queryString.toString()}`, false)
    return response.map((data: any) => new DossierRecord(data))
  }
}
