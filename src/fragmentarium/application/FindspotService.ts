import Bluebird from 'bluebird'
import { Findspot } from 'fragmentarium/domain/archaeology'
import { FindspotRepository } from 'fragmentarium/infrastructure/FindspotRepository'

export class FindspotService {
  constructor(private readonly findspotRepository: FindspotRepository) {}

  fetchFindspots(): Bluebird<Findspot[]> {
    return this.findspotRepository.fetchFindspots()
  }
}
