import { Findspot } from 'fragmentarium/domain/archaeology'
import {
  FindspotDto,
  fromFindspotDto,
} from 'fragmentarium/domain/archaeologyDtos'
import { JsonApiClient } from 'index'

export interface FindspotRepository {
  fetchFindspots(): Promise<Findspot[]>
}

export class ApiFindspotRepository implements FindspotRepository {
  constructor(private readonly apiClient: JsonApiClient) {}

  fetchFindspots(): Promise<Findspot[]> {
    return this.apiClient
      .fetchJson<FindspotDto[]>('/findspots', false)
      .then((findspots) => findspots.map(fromFindspotDto))
  }
}
