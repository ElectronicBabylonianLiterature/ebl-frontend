import DossiersRepository from 'dossiers/infrastructure/DossiersRepository'
import DossierRecord from 'dossiers/domain/DossierRecord'
import Bluebird from 'bluebird'

export interface DossiersSearch {
  queryByIds(query: string[]): Bluebird<readonly DossierRecord[]>
  searchDossier(
    query: string,
    filters?: { provenance?: string; scriptPeriod?: string }
  ): Bluebird<readonly DossierRecord[]>
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

  searchDossier(
    query: string,
    filters?: { provenance?: string; scriptPeriod?: string }
  ): Bluebird<readonly DossierRecord[]> {
    return this.dossiersRepository.searchDossier(query, filters)
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
