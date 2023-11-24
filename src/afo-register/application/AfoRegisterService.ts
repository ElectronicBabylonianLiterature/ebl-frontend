import Promise from 'bluebird'
import AfoRegisterRecord, {
  AfoRegisterRecordSuggestion,
} from 'afo-register/domain/Record'
import AfoRegisterRepository from 'afo-register/infrastructure/AfoRegisterRepository'

export interface afoRegisterSearch {
  search(query: string): Promise<readonly AfoRegisterRecord[]>
  searchSuggestions(
    query: string
  ): Promise<readonly AfoRegisterRecordSuggestion[]>
}

export default class AfoRegisterService implements afoRegisterSearch {
  private readonly afoRegisterRepository: AfoRegisterRepository

  constructor(afoRegisterRepository: AfoRegisterRepository) {
    this.afoRegisterRepository = afoRegisterRepository
  }

  search(query: string): Promise<readonly AfoRegisterRecord[]> {
    return this.afoRegisterRepository.search(query)
  }

  searchTextsAndNumbers(
    query: readonly string[]
  ): Promise<readonly AfoRegisterRecord[]> {
    return this.afoRegisterRepository.searchTextsAndNumbers(query)
  }

  searchSuggestions(
    query: string
  ): Promise<readonly AfoRegisterRecordSuggestion[]> {
    return this.afoRegisterRepository.searchSuggestions(query)
  }
}
