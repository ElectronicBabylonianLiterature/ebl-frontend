import DossiersRepository from 'dossiers/infrastructure/DossiersRepository'
import DossierRecord from 'dossiers/domain/DossierRecord'

export interface DossiersSearch {
  searchByIds(query: string): Promise<readonly DossierRecord[]>
}

export default class DossiersService implements DossiersSearch {
  private readonly dossiersRepository: DossiersRepository

  constructor(afoRegisterRepository: DossiersRepository) {
    this.dossiersRepository = afoRegisterRepository
  }

  searchByIds(query: string): Promise<readonly DossierRecord[]> {
    return this.dossiersRepository.searchByIds(query)
  }
}
