import AfoRegisterRecord from 'afo-register/domain/Record'
import Promise from 'bluebird'
import ApiClient from 'http/ApiClient'

export default class BibliographyRepository {
  private readonly apiClient: ApiClient

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient
  }

  search(query: string): Promise<AfoRegisterRecord[]> {
    return this.apiClient.fetchJson(
      `/afo-register?${encodeURIComponent(query)}`,
      false
    )
  }
}
