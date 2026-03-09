import DossiersRepository from 'dossiers/infrastructure/DossiersRepository'
import DossierRecord, {
  DossierRecordSuggestion,
} from 'dossiers/domain/DossierRecord'
import Bluebird from 'bluebird'

export interface DossiersSearch {
  queryByIds(query: string[]): Bluebird<readonly DossierRecord[]>
  searchSuggestions(
    query: string,
    filters?: {
      provenance?: string | null
      scriptPeriod?: string | null
      genre?: string | null
    },
  ): Bluebird<readonly DossierRecordSuggestion[]>
  fetchAllDossiers(): Bluebird<readonly DossierRecord[]>
  fetchFilteredDossiers(filters: {
    provenance?: string
    scriptPeriod?: string
    genre?: string
  }): Bluebird<readonly DossierRecord[]>
}

export default class DossiersService implements DossiersSearch {
  private readonly dossiersRepository: DossiersRepository

  constructor(afoRegisterRepository: DossiersRepository) {
    this.dossiersRepository = afoRegisterRepository
  }

  queryByIds(query: string[]): Bluebird<readonly DossierRecord[]> {
    return this.dossiersRepository.queryByIds(query)
  }

  searchSuggestions(
    query: string,
    filters?: {
      provenance?: string | null
      scriptPeriod?: string | null
      genre?: string | null
    },
  ): Bluebird<readonly DossierRecordSuggestion[]> {
    return this.dossiersRepository.searchSuggestions(query, filters)
  }

  fetchAllDossiers(): Bluebird<readonly DossierRecord[]> {
    return this.dossiersRepository.fetchAllDossiers()
  }

  fetchFilteredDossiers(filters: {
    provenance?: string
    scriptPeriod?: string
    genre?: string
  }): Bluebird<readonly DossierRecord[]> {
    return this.dossiersRepository.fetchFilteredDossiers(filters)
  }
}
