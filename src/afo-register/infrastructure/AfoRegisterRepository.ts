import AfoRegisterRecord, {
  AfoRegisterRecordSuggestion,
} from 'afo-register/domain/Record'
import Promise from 'bluebird'
import FragmentService from 'fragmentarium/application/FragmentService'
import ApiClient from 'http/ApiClient'

function createAfoRegisterRecord(data): AfoRegisterRecord {
  return new AfoRegisterRecord(data)
}

function createAfoRegisterRecordSuggestion(data): AfoRegisterRecordSuggestion {
  return new AfoRegisterRecordSuggestion(data)
}

function injectFragmentReferecesToRecord(
  record: AfoRegisterRecord,
  fragmentService: FragmentService
): Promise<AfoRegisterRecord> {
  const { text, textNumber } = record
  return fragmentService
    .query({ traditionalReferences: text + ' ' + textNumber })
    .then((queryResult) => {
      return record.setFragmentNumbers(
        queryResult.items.map((item) => item.museumNumber)
      )
    })
}

export default class AfoRegisterRepository {
  private readonly apiClient: ApiClient

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient
  }

  search(
    query: string,
    fragmentService?: FragmentService
  ): Promise<AfoRegisterRecord[]> {
    return this.apiClient
      .fetchJson(`/afo-register?${query}`, false)
      .then((result) => result.map(createAfoRegisterRecord))
      .then((records) => {
        if (fragmentService) {
          return Promise.all(
            records.map((record) =>
              injectFragmentReferecesToRecord(record, fragmentService)
            )
          )
        } else {
          return records
        }
      })
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
