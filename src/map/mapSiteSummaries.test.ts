import { aggregateFindspotMapData } from './findspotMapData'
import { deriveMapSiteCapabilities } from './mapSiteCapabilities'
import { findMapSite } from './mapSites'
import {
  SITE_MARKER_CODES,
  buildSiteResearchSummaries,
  siteMarkerState,
  siteMarkerStates,
} from './mapSiteSummaries'
import {
  excavationPolygon,
  findspotMapData,
  historicalMapOverlay,
  provenanceRecord,
} from 'test-support/map-fixtures'

const POLYGON = 'assur-area-a-checksum'

const assurCapabilities = deriveMapSiteCapabilities(findMapSite('assur')!, {
  overlays: [historicalMapOverlay(), historicalMapOverlay({ id: 'second' })],
  excavationPolygons: [excavationPolygon()],
  fragmentMapData: [findspotMapData()],
  fragmentDataStatus: 'loaded',
})
const kalhuCapabilities = deriveMapSiteCapabilities(findMapSite('kalhu')!, {
  overlays: [],
  excavationPolygons: [excavationPolygon({ siteId: 'kalhu' })],
})

const assur = provenanceRecord({ id: 'assur', longName: 'Aššur' })
const kalhu = provenanceRecord({ id: 'kalhu', longName: 'Kalḫu' })
const nineveh = provenanceRecord({ id: 'nineveh', longName: 'Nineveh' })

const summaries = buildSiteResearchSummaries({
  provenances: [assur, kalhu, nineveh],
  capabilities: [assurCapabilities, kalhuCapabilities],
  excavationPolygonIndex: new Map([
    ['assur', [excavationPolygon({ polygonId: POLYGON })]],
    ['kalhu', [excavationPolygon({ polygonId: 'kalhu-a', siteId: 'kalhu' })]],
  ]),
  polygonSummaries: aggregateFindspotMapData([
    findspotMapData({ polygonIds: [POLYGON] }),
  ]),
})

describe('buildSiteResearchSummaries', () => {
  it('keys summaries by provenance id', () => {
    expect(summaries.get('assur')).toEqual({
      siteId: 'assur',
      siteName: 'Aššur',
      totalPolygonCount: 1,
      linkedPolygonCount: 1,
      mappedFindspotCount: 1,
      accessibleFragmentCount: 4,
      historicalOverlayCount: 2,
    })
  })

  it('reports a mapped site with no linked polygons honestly', () => {
    expect(summaries.get('kalhu')).toMatchObject({
      totalPolygonCount: 1,
      linkedPolygonCount: 0,
      accessibleFragmentCount: 0,
      historicalOverlayCount: 0,
    })
  })

  it('gives an unmapped provenance no zeroed row at all', () => {
    expect(summaries.has('nineveh')).toBe(false)
  })
})

describe('siteMarkerState', () => {
  it('promotes a site with live fragment-linked map data', () => {
    expect(siteMarkerState(summaries.get('assur'))).toEqual({
      siteCode: SITE_MARKER_CODES.fragmentMapData,
      historicalMapCount: 2,
      linkedPolygonCount: 1,
    })
  })

  it('marks a site that only has excavation polygons', () => {
    expect(siteMarkerState(summaries.get('kalhu'))?.siteCode).toBe(
      SITE_MARKER_CODES.excavationPolygons,
    )
  })

  it('marks a site with polygons but no geometry as coordinates only', () => {
    expect(
      siteMarkerState({
        siteId: 'x',
        siteName: 'X',
        totalPolygonCount: 0,
        linkedPolygonCount: 0,
        mappedFindspotCount: 0,
        accessibleFragmentCount: 0,
        historicalOverlayCount: 0,
      }).siteCode,
    ).toBe(SITE_MARKER_CODES.coordinates)
  })

  it('falls back to coordinates only without a summary', () => {
    expect(siteMarkerState(undefined)).toEqual({
      siteCode: SITE_MARKER_CODES.coordinates,
      historicalMapCount: 0,
      linkedPolygonCount: 0,
    })
  })
})

describe('siteMarkerStates', () => {
  it('maps every summarised provenance to its marker state', () => {
    expect([...siteMarkerStates(summaries).keys()]).toEqual(['assur', 'kalhu'])
  })
})
