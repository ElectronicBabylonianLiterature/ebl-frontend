import type { Feature, Polygon } from 'geojson'
import type { ExcavationPolygon } from 'map/excavationPolygonIndex'

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
