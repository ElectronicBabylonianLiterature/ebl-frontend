import Bluebird from 'bluebird'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import type { ExcavationPolygonIndex } from 'map/excavationPolygonIndex'
import type { FindspotMapData } from 'map/findspotMapData'
import type { MapSiteId } from 'map/mapSites'
import type {
  FragmentMapDataState,
  FragmentMapDataStatus,
} from 'map/useFragmentMapData'
import {
  excavationPolygon,
  findspotMapDataDto,
} from 'test-support/map-fixtures'

export const SITE_IDS: readonly MapSiteId[] = [
  'assur',
  'kalhu',
  'nippur',
  'uruk',
]
export const SITES = {
  assur: {
    param: 'ASSUR',
    name: 'Aššur',
    polygonId: 'assur-area-a-checksum',
  },
  kalhu: {
    param: 'KALHU',
    name: 'Kalḫu',
    polygonId: 'kalhu-area-a-checksum',
  },
  nippur: {
    param: 'NIPPUR',
    name: 'Nippur',
    polygonId: 'nippur-area-a-checksum',
  },
  uruk: {
    param: 'URUK',
    name: 'Uruk',
    polygonId: 'uruk-area-a-checksum',
  },
} as const

type MapData = readonly FindspotMapData[]
type Responder = (siteId: string) => Bluebird<MapData>

export function canonicalIndex(): ExcavationPolygonIndex {
  return new Map(
    SITE_IDS.map((siteId) => [
      siteId,
      [
        excavationPolygon({
          polygonId: SITES[siteId].polygonId,
          siteId,
          name: SITES[siteId].name + ' Area A',
        }),
      ],
    ]),
  )
}

export function mappedFindspot(
  siteId: MapSiteId,
  findspotId: number,
): FindspotMapData {
  const site = SITES[siteId]
  return findspotMapDataDto({
    findspotId,
    siteId: site.param,
    siteName: site.name,
    polygonIds: [site.polygonId],
  })
}

export function serviceReturning(responder: Responder): FindspotService {
  return { fetchMapData: jest.fn(responder) } as unknown as FindspotService
}

export function status(
  state: FragmentMapDataState,
  siteId: MapSiteId,
): FragmentMapDataStatus | undefined {
  return state.sites.get(siteId)?.status
}

export function deferredMapData(): {
  promise: Bluebird<MapData>
  resolve: (value: MapData) => void
} {
  let resolve!: (value: MapData) => void
  const promise = new Bluebird<MapData>((fulfill) => {
    resolve = (value) => fulfill(value)
  })
  return { promise, resolve }
}
