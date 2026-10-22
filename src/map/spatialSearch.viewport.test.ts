import type {
  ExcavationPolygon,
  ExcavationPolygonIndex,
} from 'map/excavationPolygonIndex'
import type { BoundingBox } from 'map/mapGeometry'
import { viewportSearchBounds } from 'map/spatialBounds'
import { boundingBoxRing } from 'map/spatialPredicates'
import { runSpatialSearch, type SpatialSearchData } from 'map/spatialSearch'
import { excavationPolygon } from 'test-support/map-fixtures'

function polygon(polygonId: string, bounds: BoundingBox): ExcavationPolygon {
  return excavationPolygon({
    polygonId,
    bounds,
    geometry: { type: 'Polygon', coordinates: [[...boundingBoxRing(bounds)]] },
  })
}

const INDEX: ExcavationPolygonIndex = new Map([
  [
    'assur',
    [
      polygon('assur', [43, 35, 44, 36]),
      polygon('east', [178, 35, 179, 36]),
      polygon('outside', [150, 35, 151, 36]),
      polygon('west', [-179, 35, -178, 36]),
      polygon('western', [-80, 35, -79, 36]),
    ],
  ],
])

const DATA: SpatialSearchData = {
  summaries: new Map(),
  siteStatuses: new Map([['assur', 'available']]),
}

describe('searching the current viewport', () => {
  it.each<[string, BoundingBox, readonly string[]]>([
    ['narrow view', [42, 34, 45, 37], ['assur']],
    ['180-degree view', [-90, 30, 90, 40], ['assur', 'western']],
    ['240-degree view', [-120, 30, 120, 40], ['assur', 'western']],
    [
      'full-world view',
      [-180, -60, 180, 60],
      ['assur', 'east', 'outside', 'west', 'western'],
    ],
    [
      'view spanning multiple worlds',
      [-200, -60, 200, 60],
      ['assur', 'east', 'outside', 'west', 'western'],
    ],
    ['wrapped view', [170, 30, -170, 40], ['east', 'west']],
    ['repeated-world view', [402, 34, 405, 37], ['assur']],
    ['empty wide view', [-120, -40, 120, -30], []],
  ])('preserves the areas inside a %s', (_name, viewport, polygonIds) => {
    const bounds = viewportSearchBounds(...viewport)

    expect(bounds).not.toBeNull()
    expect(
      runSpatialSearch({ type: 'viewport', bounds: bounds ?? [] }, INDEX, DATA),
    ).toMatchObject({
      polygonIds,
      availablePolygonCount: polygonIds.length,
    })
  })
})
