import DossiersRepository from 'dossiers/infrastructure/DossiersRepository'
import DossierRecord from 'dossiers/domain/DossierRecord'

export interface DossiersSearch {
  queryByIds(query: string[]): Promise<readonly DossierRecord[]>
  searchDossier(query: string): Promise<readonly DossierRecord[]>
}

export default class DossiersService implements DossiersSearch {
  private readonly dossiersRepository: DossiersRepository

  constructor(afoRegisterRepository: DossiersRepository) {
    this.dossiersRepository = afoRegisterRepository
  }

  queryByIds(query: string[]): Promise<readonly DossierRecord[]> {
    return this.dossiersRepository.queryByIds(query)
  }

  searchDossier(query: string): Promise<readonly DossierRecord[]> {
    return this.dossiersRepository.searchDossier(query)
  }
}
