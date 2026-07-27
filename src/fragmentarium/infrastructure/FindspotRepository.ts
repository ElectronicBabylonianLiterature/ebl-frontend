import Bluebird from 'bluebird'
import { Findspot } from 'fragmentarium/domain/archaeology'
import {
  FindspotDto,
  fromFindspotDto,
} from 'fragmentarium/domain/archaeologyDtos'
import { JsonApiClient } from 'index'
import {
  ASSUR_SITE_ID,
  FindspotMapData,
  FindspotMapDataResponseDto,
  sanitizeFindspotMapDataResponse,
} from 'map/findspotMapData'

export interface FindspotRepository {
  fetchFindspots(): Bluebird<Findspot[]>
  fetchAssurMapData(): Bluebird<readonly FindspotMapData[]>
}

export class ApiFindspotRepository implements FindspotRepository {
  constructor(private readonly apiClient: JsonApiClient) {}

  fetchFindspots(): Bluebird<Findspot[]> {
    return this.apiClient
      .fetchJson<FindspotDto[]>('/findspots', false)
      .then((findspots) => findspots.map(fromFindspotDto))
  }

  fetchAssurMapData(): Bluebird<readonly FindspotMapData[]> {
    return this.apiClient
      .fetchJson<FindspotMapDataResponseDto>(
        `/findspots/map-data?site=${ASSUR_SITE_ID}`,
        false,
      )
      .then(sanitizeFindspotMapDataResponse)
  }
}
