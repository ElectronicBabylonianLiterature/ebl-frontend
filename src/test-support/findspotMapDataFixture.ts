import type { FindspotMapData } from 'map/findspotMapData'

export default function findspot(
  overrides: Partial<FindspotMapData> = {},
): FindspotMapData {
  return {
    findspotId: 1,
    siteId: 'ASSUR',
    siteName: 'Aššur',
    polygonIds: ['assur-area-a-checksum'],
    accessibleFragmentCount: 2,
    locationPrecision: 'excavation-area',
    matchMethod: 'verified-source',
    sector: null,
    area: 'Area A',
    building: null,
    room: null,
    ...overrides,
  }
}
