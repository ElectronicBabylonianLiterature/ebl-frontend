import { Findspot } from 'fragmentarium/domain/archaeology'
import { FindspotRepository } from 'fragmentarium/infrastructure/FindspotRepository'
import { FindspotMapData } from 'map/findspotMapData'
import { mapDataSiteParam } from 'map/mapSites'

export class UnsupportedMapDataSiteError extends Error {
  constructor(readonly siteId: string) {
    super(`No map-data endpoint is configured for site "${siteId}"`)
    this.name = 'UnsupportedMapDataSiteError'
  }
}

export class FindspotService {
  constructor(private readonly findspotRepository: FindspotRepository) {}

  fetchFindspots(): Promise<Findspot[]> {
    return this.findspotRepository.fetchFindspots()
  }

  supportsMapData(siteId: string): boolean {
    return mapDataSiteParam(siteId) !== null
  }

  fetchMapData(siteId: string): Promise<readonly FindspotMapData[]> {
    const siteParam = mapDataSiteParam(siteId)
    return siteParam === null
      ? Promise.reject(new UnsupportedMapDataSiteError(siteId))
      : this.findspotRepository.fetchMapData(siteParam)
  }
}
