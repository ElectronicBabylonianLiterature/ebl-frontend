import { Findspot } from 'fragmentarium/domain/archaeology'
import { FindspotRepository } from 'fragmentarium/infrastructure/FindspotRepository'

export class FindspotService {
  constructor(private readonly findspotRepository: FindspotRepository) {}

  fetchFindspots(): Promise<Findspot[]> {
    return this.findspotRepository.fetchFindspots()
  }
}
