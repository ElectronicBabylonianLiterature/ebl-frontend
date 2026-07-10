import Promise from 'bluebird'
import { isRealiaId, RealiaEntry } from 'realia/domain/RealiaEntry'
import RealiaRepository from 'realia/infrastructure/RealiaRepository'

export default class RealiaService {
  private readonly realiaRepository: RealiaRepository

  constructor(realiaRepository: RealiaRepository) {
    this.realiaRepository = realiaRepository
  }

  find(id: string): Promise<RealiaEntry> {
    return isRealiaId(id)
      ? this.realiaRepository.findByRealiaId(id)
      : this.realiaRepository.find(id)
  }

  search(query: string): Promise<readonly RealiaEntry[]> {
    return this.realiaRepository.search(query)
  }
}
