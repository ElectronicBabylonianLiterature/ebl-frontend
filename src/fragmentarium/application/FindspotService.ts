import Bluebird from 'bluebird'
import { Findspot } from 'fragmentarium/domain/archaeology'
import { FindspotRepository } from 'fragmentarium/infrastructure/FindspotRepository'
import { FindspotMapData } from 'map/findspotMapData'

export class FindspotService {
  constructor(private readonly findspotRepository: FindspotRepository) {}

  fetchFindspots(): Bluebird<Findspot[]> {
    return this.findspotRepository.fetchFindspots()
  }

  fetchAssurMapData(): Bluebird<readonly FindspotMapData[]> {
    return this.findspotRepository.fetchAssurMapData()
  }
}
