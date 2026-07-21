import { RealiaEntry } from 'realia/domain/RealiaEntry'
import RealiaRepository from 'realia/infrastructure/RealiaRepository'

export default class RealiaService {
  private readonly realiaRepository: RealiaRepository

  constructor(realiaRepository: RealiaRepository) {
    this.realiaRepository = realiaRepository
  }

  find(realiaId: string): Promise<RealiaEntry> {
    return this.realiaRepository.find(realiaId)
  }

  search(query: string): Promise<readonly RealiaEntry[]> {
    return this.realiaRepository.search(query)
  }
}
