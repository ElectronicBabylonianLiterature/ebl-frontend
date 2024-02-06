import { King } from 'chronology/ui/BrinkmanKings/BrinkmanKings'
import Promise from 'bluebird'
import ApiClient from 'http/ApiClient'

export default class KingsRepository {
  private readonly apiClient: ApiClient

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient
  }

  fetchAll(): Promise<King[]> {
    return this.apiClient.fetchJson('/kings-all', false)
  }
}
