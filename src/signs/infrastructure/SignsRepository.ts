import ApiClient from 'http/ApiClient'
import Promise from 'bluebird'
import { SignQuery } from 'signs/domain/Sign'
import { stringify } from 'query-string'

class SignsRepository {
  private readonly apiClient

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient
  }

  search(signQuery: SignQuery): Promise<any[]> {
    return this.apiClient.fetchJson(`/signs?${stringify(signQuery)}`, true)
  }
}

export default SignsRepository
