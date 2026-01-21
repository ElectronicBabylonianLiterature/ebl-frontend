import Promise from 'bluebird'
import DossiersRepository from 'dossiers/infrastructure/DossiersRepository'
import DossierRecord from 'dossiers/domain/DossierRecord'
import { DossierQuery } from 'dossiers/domain/DossierQuery'
import { DossierSearchResult } from 'dossiers/domain/DossierSearchResult'

export interface DossiersSearch {
  queryByIds(query: string[]): Promise<readonly DossierRecord[]>
  search(query: DossierQuery): Promise<DossierSearchResult>
}

export default class DossiersService implements DossiersSearch {
  private readonly dossiersRepository: DossiersRepository

  constructor(afoRegisterRepository: DossiersRepository) {
    this.dossiersRepository = afoRegisterRepository
  }

  queryByIds(query: string[]): Promise<readonly DossierRecord[]> {
    return this.dossiersRepository.queryByIds(query)
  }

  search(query: DossierQuery): Promise<DossierSearchResult> {
    return this.dossiersRepository.search(query)
  }
}
