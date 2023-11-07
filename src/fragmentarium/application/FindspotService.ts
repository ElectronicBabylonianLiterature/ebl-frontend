import Bluebird from 'bluebird'
import { Findspot, fromFindspotDto } from 'fragmentarium/domain/archaeology'
import { JsonApiClient } from 'index'

export interface FindspotRepository {
  fetchFindspots(): Bluebird<Findspot[]>
}

export class ApiFindspotRepository implements FindspotRepository {
  constructor(private readonly apiClient: JsonApiClient) {}

  fetchFindspots(): Bluebird<Findspot[]> {
    return this.apiClient
      .fetchJson('/findspots', false)
      .then((findspots) => findspots.map(fromFindspotDto))
  }
}

export class FindspotService {
  constructor(private readonly findspotRepository: FindspotRepository) {}

  fetchFindspots(): Bluebird<Findspot[]> {
    return this.findspotRepository.fetchFindspots()
  }
}
