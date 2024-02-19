import Bluebird from 'bluebird'
import { Findspot } from 'fragmentarium/domain/archaeology'
import { fromFindspotDto } from 'fragmentarium/domain/archaeologyDtos'
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
