import ApiClient from 'http/ApiClient'
import Promise from 'bluebird'
import Sign, { SignQuery } from 'signs/domain/Sign'
import { stringify } from 'query-string'

class SignsRepository {
  private readonly apiClient

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient
  }

  search(signQuery: SignQuery): Promise<Sign[]> {
    return this.apiClient
      .fetchJson(`/signs?${stringify(signQuery)}`, true)
      .then((signDtos) => signDtos.map((signDto) => Sign.fromJson(signDto)))
  }
}

export default SignsRepository
