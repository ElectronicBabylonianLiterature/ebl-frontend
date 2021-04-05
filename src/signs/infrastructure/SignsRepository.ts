import ApiClient from 'http/ApiClient'
import Word from 'dictionary/domain/Word'
import Promise from 'bluebird'

class SignsRepository {
  private readonly apiClient

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient
  }

  search(query: string): Promise<any[]> {
    console.log(query)
    return this.apiClient.fetchJson(
      `/signs?query=${encodeURIComponent(query)}`,
      true
    )
  }
}

export default SignsRepository
