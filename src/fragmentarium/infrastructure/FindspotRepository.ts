import Bluebird from 'bluebird'
import { Findspot } from 'fragmentarium/domain/archaeology'
import {
  FindspotDto,
  fromFindspotDto,
} from 'fragmentarium/domain/archaeologyDtos'
import { JsonApiClient } from 'index'
import {
  FindspotMapData,
  FindspotMapDataResponseDto,
  sanitizeFindspotMapDataResponse,
} from 'map/findspotMapData'

export interface FindspotRepository {
  fetchFindspots(): Bluebird<Findspot[]>
  fetchMapData(siteParam: string): Bluebird<readonly FindspotMapData[]>
}

export class ApiFindspotRepository implements FindspotRepository {
  constructor(private readonly apiClient: JsonApiClient) {}

  fetchFindspots(): Bluebird<Findspot[]> {
    return this.apiClient
      .fetchJson<FindspotDto[]>('/findspots', false)
      .then((findspots) => findspots.map(fromFindspotDto))
  }

  fetchMapData(siteParam: string): Bluebird<readonly FindspotMapData[]> {
    return this.apiClient
      .fetchJson<FindspotMapDataResponseDto>(
        `/findspots/map-data?site=${encodeURIComponent(siteParam)}`,
        false,
      )
      .then(sanitizeFindspotMapDataResponse)
  }
}
