import AfoRegisterRecord, {
  AfoRegisterRecordSuggestion,
} from 'afo-register/domain/Record'
import Promise from 'bluebird'
import ApiClient from 'http/ApiClient'

function createAfoRegisterRecord(data) {
  return new AfoRegisterRecord(data)
}

function createAfoRegisterRecordSuggestion(data) {
  return new AfoRegisterRecordSuggestion(data)
}

export default class AfoRegisterRepository {
  private readonly apiClient: ApiClient

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient
  }

  search(query: string): Promise<AfoRegisterRecord[]> {
    return this.apiClient
      .fetchJson(`/afo-register?${query}`, false)
      .then((result) => result.map(createAfoRegisterRecord))
  }

  searchTextsAndNumbers(
    query: readonly string[]
  ): Promise<AfoRegisterRecord[]> {
    return this.apiClient
      .postJson(`/afo-register/texts-numbers`, query, false)
      .then((result) => result.map(createAfoRegisterRecord))
  }

  searchSuggestions(query: string): Promise<AfoRegisterRecordSuggestion[]> {
    return this.apiClient
      .fetchJson(`/afo-register/suggestions?text_query=${query}`, false)
      .then((result) => result.map(createAfoRegisterRecordSuggestion))
  }
}
