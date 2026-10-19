import { Findspot } from 'fragmentarium/domain/archaeology'
import {
  FindspotDto,
  fromFindspotDto,
} from 'fragmentarium/domain/archaeologyDtos'
import { JsonApiClient } from 'http/JsonApiClient'
import {
  FindspotMapData,
  FindspotMapDataResponseDto,
} from 'map/findspotMapData'
import {
  IncompatibleFindspotMapDataError,
  requireCompatibleFindspotMapDataResponse,
} from 'map/findspotMapDataSanitizer'
import { findMapSiteByDataParam } from 'map/mapSites'

export interface FindspotRepository {
  fetchFindspots(): Promise<Findspot[]>
  fetchMapData(siteParam: string): Promise<readonly FindspotMapData[]>
}

export class ApiFindspotRepository implements FindspotRepository {
  constructor(private readonly apiClient: JsonApiClient) {}

  fetchFindspots(): Promise<Findspot[]> {
    return this.apiClient
      .fetchJson<FindspotDto[]>('/findspots', false)
      .then((findspots) => findspots.map(fromFindspotDto))
  }

  fetchMapData(siteParam: string): Promise<readonly FindspotMapData[]> {
    const site = findMapSiteByDataParam(siteParam)
    if (!site) {
      return Promise.reject(
        new IncompatibleFindspotMapDataError(
          'Unknown map-data site parameter ' + siteParam,
        ),
      )
    }

    return this.apiClient
      .fetchJson<FindspotMapDataResponseDto>(
        '/findspots/map-data?site=' + encodeURIComponent(siteParam),
        false,
      )
      .then((response) =>
        requireCompatibleFindspotMapDataResponse(
          response,
          siteParam,
          site.siteName,
        ),
      )
  }
}
