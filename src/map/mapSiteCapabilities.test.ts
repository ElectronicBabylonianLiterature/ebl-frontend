import {
  deriveAllMapSiteCapabilities,
  deriveMapSiteCapabilities,
  fragmentDataStatusText,
} from './mapSiteCapabilities'
import {
  findMapSite,
  isMapSiteId,
  mapDataSiteParam,
  mapSites,
} from './mapSites'
import {
  excavationPolygon,
  findspotMapData,
  historicalMapOverlay,
} from 'test-support/map-fixtures'

const assur = findMapSite('assur')!
const kalhu = findMapSite('kalhu')!

describe('mapSites', () => {
  it('exposes the four canonical map sites', () => {
    expect(mapSites().map((site) => site.siteId)).toEqual([
      'assur',
      'kalhu',
      'nippur',
      'uruk',
    ])
  })

  it('recognises canonical ids only', () => {
    expect(isMapSiteId('assur')).toBe(true)
    expect(isMapSiteId('nineveh')).toBe(false)
    expect(isMapSiteId(7)).toBe(false)
  })

  it('returns undefined for an unknown site', () => {
    expect(findMapSite('nineveh')).toBeUndefined()
  })

  it('exposes a map-data parameter only for configured sites', () => {
    expect(mapDataSiteParam('assur')).toBe('ASSUR')
    expect(mapDataSiteParam('kalhu')).toBeNull()
    expect(mapDataSiteParam('nineveh')).toBeNull()
  })
})

describe('deriveMapSiteCapabilities', () => {
  it('reports available fragment data for a configured site', () => {
    const capabilities = deriveMapSiteCapabilities(assur, {
      overlays: [historicalMapOverlay()],
      excavationPolygons: [excavationPolygon()],
      fragmentMapData: [findspotMapData()],
      fragmentDataStatus: 'loaded',
    })

    expect(capabilities).toMatchObject({
      siteId: 'assur',
      hasCoordinates: true,
      hasSiteBoundary: false,
      hasExcavationPolygons: true,
      excavationPolygonCount: 1,
      hasHistoricalMaps: true,
      historicalMapCount: 1,
      hasFragmentMapData: true,
      fragmentDataState: 'available',
      supportsMapFragmentFilters: false,
      hasTerrain: false,
      has3dModels: false,
    })
  })

  it('reports empty rather than unavailable for a loaded empty response', () => {
    expect(
      deriveMapSiteCapabilities(assur, {
        overlays: [],
        excavationPolygons: [],
        fragmentMapData: [],
        fragmentDataStatus: 'loaded',
      }),
    ).toMatchObject({ fragmentDataState: 'empty', hasFragmentMapData: false })
  })

  it.each([
    ['loading', 'loading'],
    ['error', 'error'],
    [undefined, 'idle'],
  ])('maps status %s to state %s', (status, expected) => {
    expect(
      deriveMapSiteCapabilities(assur, {
        overlays: [],
        excavationPolygons: [],
        fragmentDataStatus: status as never,
      }).fragmentDataState,
    ).toBe(expected)
  })

  it('never reports fragment data for an unconfigured site', () => {
    expect(
      deriveMapSiteCapabilities(kalhu, {
        overlays: [historicalMapOverlay({ siteId: 'kalhu' })],
        excavationPolygons: [excavationPolygon({ siteId: 'kalhu' })],
        fragmentMapData: [findspotMapData()],
        fragmentDataStatus: 'loaded',
      }),
    ).toMatchObject({
      fragmentDataState: 'not-configured',
      hasFragmentMapData: false,
      hasExcavationPolygons: true,
      hasHistoricalMaps: true,
    })
  })

  it('ignores polygons without geometry when reporting coordinates', () => {
    expect(
      deriveMapSiteCapabilities(assur, {
        overlays: [],
        excavationPolygons: [excavationPolygon({ bounds: null })],
      }).hasCoordinates,
    ).toBe(false)
  })
})

describe('deriveAllMapSiteCapabilities', () => {
  it('derives one entry per configured site', () => {
    expect(
      deriveAllMapSiteCapabilities({
        overlays: [],
        excavationPolygons: [],
      }),
    ).toHaveLength(4)
  })
})

describe('fragmentDataStatusText', () => {
  const base = deriveMapSiteCapabilities(assur, {
    overlays: [],
    excavationPolygons: [],
  })

  it.each([
    ['not-configured', 'not yet available'],
    ['loading', 'Loading excavation fragment data'],
    ['idle', 'Loading excavation fragment data'],
    ['error', 'unavailable'],
    ['empty', 'No mapped excavation fragments'],
    ['available', 'is available for Aššur'],
  ])('describes %s', (state, expected) => {
    expect(
      fragmentDataStatusText({ ...base, fragmentDataState: state as never }),
    ).toContain(expected)
  })
})
