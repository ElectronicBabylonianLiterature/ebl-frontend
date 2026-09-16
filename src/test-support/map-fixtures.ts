import type { Feature, Polygon } from 'geojson'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import type { FindspotMapData } from 'map/findspotMapData'
import type { HistoricalMapOverlay } from 'map/historicalOverlays'
import type { ExcavationPolygon } from 'map/excavationPolygonIndex'

export function provenanceRecord(
  overrides: Partial<ProvenanceRecord> = {},
): ProvenanceRecord {
  return {
    id: 'babylon',
    longName: 'Babylon',
    abbreviation: 'Bab',
    sortKey: 1,
    coordinates: { latitude: 32.542, longitude: 44.42 },
    ...overrides,
  }
}

export function findspotMapData(
  overrides: Partial<FindspotMapData> = {},
): FindspotMapData {
  return {
    findspotId: 123,
    siteId: 'ASSUR',
    siteName: 'Aššur',
    polygonIds: ['assur-area-a-checksum'],
    accessibleFragmentCount: 4,
    locationPrecision: 'excavation-area',
    matchMethod: 'verified-source',
    sector: null,
    area: 'Area A',
    building: null,
    room: null,
    ...overrides,
  }
}

export function historicalMapOverlay(
  overrides: Partial<HistoricalMapOverlay> = {},
): HistoricalMapOverlay {
  return {
    id: 'assur-test-overlay',
    siteId: 'assur',
    siteName: 'Aššur',
    title: 'Test overlay',
    sourceFilename: 'test.tif',
    attribution: 'Test attribution',
    type: 'raster-tiles',
    tiles: ['/historical-maps/assur/test/tiles/{z}/{x}/{y}.png'],
    bounds: [43.25, 35.44, 43.27, 35.46],
    minZoom: 13,
    maxZoom: 18,
    tileSize: 256,
    defaultOpacity: 0.7,
    ...overrides,
  }
}

export function excavationPolygon(
  overrides: Partial<ExcavationPolygon> = {},
): ExcavationPolygon {
  return {
    polygonId: 'assur-area-a-checksum',
    siteId: 'assur',
    name: 'Area A',
    bounds: [43.25, 35.45, 43.26, 35.46],
    areaSquareKm: 0.8,
    geometry: polygonFeature('assur-area-a-checksum', 'assur').geometry,
    ...overrides,
  }
}

export function polygonFeature(
  polygonId: string,
  siteId: string,
  name = 'Area A',
): Feature<Polygon, Record<string, unknown>> {
  return {
    type: 'Feature',
    id: polygonId,
    properties: {
      id: polygonId,
      siteId,
      name,
      locationType: 'excavation_area',
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [43.25, 35.45],
          [43.26, 35.45],
          [43.26, 35.46],
          [43.25, 35.46],
          [43.25, 35.45],
        ],
      ],
    },
  }
}
