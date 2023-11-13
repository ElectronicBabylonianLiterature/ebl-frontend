import Promise from 'bluebird'
import AfoRegisterRecord, {
  AfoRegisterRecordSuggestion,
} from 'afo-register/domain/Record'
import AfoRegisterRepository from 'afo-register/infrastructure/AfoRegisterRepository'

export interface afoRegisterSearch {
  search(query: string): Promise<readonly AfoRegisterRecord[]>
}

export default class AfoRegisterService implements afoRegisterSearch {
  private readonly afoRegisterRepository: AfoRegisterRepository

  constructor(afoRegisterRepository: AfoRegisterRepository) {
    this.afoRegisterRepository = afoRegisterRepository
  }

  search(query: string): Promise<readonly AfoRegisterRecord[]> {
    return this.afoRegisterRepository.search(query)
  }

  searchSuggestions(
    query: string
  ): Promise<readonly AfoRegisterRecordSuggestion[]> {
    return this.afoRegisterRepository.searchSuggestions(query)
  }
}
