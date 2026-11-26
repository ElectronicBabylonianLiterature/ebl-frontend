import { derivePolygonResearchSummary } from 'map/domain/mapResearchSummary'
import { aggregateFindspotMapData } from 'fragmentarium/domain/findspotMapDataSanitizer'
import { findspotMapDataDto } from 'test-support/map-fixtures'

it('retains stable identity and unknown area when canonical polygon metadata is absent', () => {
  const row = findspotMapDataDto({
    sector: undefined,
    area: undefined,
    building: undefined,
    room: undefined,
  })
  const summary = aggregateFindspotMapData([row]).get(row.polygonIds[0])
  const research = derivePolygonResearchSummary({
    polygonId: row.polygonIds[0],
    polygon: undefined,
    summary,
    siteName: 'Assur',
  })

  expect(research).toMatchObject({
    polygonId: row.polygonIds[0],
    displayName: row.polygonIds[0],
    siteId: '',
    areaSquareKm: null,
    mappedFindspotCount: 1,
    accessibleFragmentCount: 2,
  })
  expect(research.findspots[0]).toMatchObject({
    sector: null,
    area: null,
    building: null,
    room: null,
  })
  const empty = derivePolygonResearchSummary({
    polygonId: 'unmapped',
    polygon: undefined,
    summary: undefined,
    siteName: 'Assur',
  })
  expect(empty).toMatchObject({
    mappedFindspotCount: 0,
    accessibleFragmentCount: 0,
    findspots: [],
  })
})
