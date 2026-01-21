import DossierRecord from 'dossiers/domain/DossierRecord'
import Promise from 'bluebird'
import ApiClient from 'http/ApiClient'
import { stringify } from 'query-string'
import { DossierQuery } from 'dossiers/domain/DossierQuery'
import { DossierSearchResult } from 'dossiers/domain/DossierSearchResult'

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

  search(query: DossierQuery): Promise<DossierSearchResult> {
    const queryString = new URLSearchParams()
    if (query.searchText) queryString.append('searchText', query.searchText)
    if (query.period) queryString.append('period', query.period)
    if (query.periodModifier)
      queryString.append('periodModifier', query.periodModifier)
    if (query.dateFrom) queryString.append('dateFrom', query.dateFrom)
    if (query.dateTo) queryString.append('dateTo', query.dateTo)
    if (query.kings) queryString.append('kings', query.kings)
    if (query.limit) queryString.append('limit', query.limit.toString())
    if (query.page) queryString.append('page', query.page.toString())

    return this.apiClient
      .fetchJson(`/dossiers/search?${queryString.toString()}`, false)
      .then((response: { totalCount: number; dossiers: any[] }) => ({
        totalCount: response.totalCount,
        dossiers: response.dossiers.map((data: any) => new DossierRecord(data)),
      }))
  }
}
