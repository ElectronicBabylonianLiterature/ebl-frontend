import type { Geometry } from 'geojson'
import {
  excavationPolygon,
  findspotMapDataDto as findspotMapData,
} from 'test-support/map-fixtures'
import type { ExcavationPolygonIndex } from 'map/excavationPolygonIndex'
import { aggregateFindspotMapData } from 'map/findspotMapDataSanitizer'
import {
  EMPTY_SPATIAL_SEARCH_RESULT,
  type SpatialSearchData,
  type SpatialSearchShape,
  runSpatialSearch,
  spatialSearchDescription,
} from 'map/spatialSearch'

function square(west: number, south: number, size: number): Geometry {
  return {
    type: 'Polygon',
    coordinates: [
      [
        [west, south],
        [west + size, south],
        [west + size, south + size],
        [west, south + size],
        [west, south],
      ],
    ],
  }
}

function polygon(polygonId: string, west: number, south: number) {
  return excavationPolygon({
    polygonId,
    siteId: 'assur',
    geometry: square(west, south, 1),
    bounds: [west, south, west + 1, south + 1],
  })
}

const INDEX: ExcavationPolygonIndex = new Map([
  ['assur', [polygon('near', 0, 0), polygon('far', 20, 20)]],
])

const DATA: SpatialSearchData = {
  summaries: aggregateFindspotMapData([
    findspotMapData({
      findspotId: 7,
      polygonIds: ['near'],
      accessibleFragmentCount: 3,
    }),
    findspotMapData({
      findspotId: 2,
      polygonIds: ['near'],
      accessibleFragmentCount: 5,
    }),
    findspotMapData({
      findspotId: 9,
      polygonIds: ['far'],
      accessibleFragmentCount: 1,
    }),
  ]),
  siteStatuses: new Map([['assur', 'available']]),
}

describe('runSpatialSearch', () => {
  it('collects mapped findspots inside the viewport', () => {
    expect(
      runSpatialSearch(
        { type: 'viewport', bounds: [[-1, -1, 2, 2]] },
        INDEX,
        DATA,
      ),
    ).toEqual({
      polygonIds: ['near'],
      findspotIds: [2, 7],
      mappedPolygonCount: 1,
      accessibleFragmentCount: 8,
      availablePolygonCount: 1,
      loadingPolygonCount: 0,
      unavailablePolygonCount: 0,
    })
  })

  it('treats a drawn rectangle the same way', () => {
    expect(
      runSpatialSearch(
        { type: 'bounding-box', bounds: [[-1, -1, 2, 2]] },
        INDEX,
        DATA,
      ).polygonIds,
    ).toEqual(['near'])
  })

  it('unions matches from split antimeridian bounds', () => {
    const index: ExcavationPolygonIndex = new Map([
      [
        'assur',
        [
          polygon('east', 179, 0),
          excavationPolygon({
            polygonId: 'west',
            siteId: 'assur',
            geometry: square(-180, 0, 1),
            bounds: [-180, 0, -179, 1],
          }),
        ],
      ],
    ])
    const result = runSpatialSearch(
      {
        type: 'viewport',
        bounds: [
          [178, -1, 180, 2],
          [-180, -1, -178, 2],
        ],
      },
      index,
      { summaries: new Map(), siteStatuses: DATA.siteStatuses },
    )

    expect(result.polygonIds).toEqual(['east', 'west'])
    expect(result.availablePolygonCount).toBe(2)
  })

  it.each<SpatialSearchShape>([
    { type: 'viewport', bounds: [] },
    { type: 'viewport', bounds: [[0, 0, 0, 1]] },
    { type: 'viewport', bounds: [[0, 0, Number.NaN, 1]] },
    { type: 'viewport', bounds: [[-181, 0, 1, 1]] },
  ])('fails closed for invalid search bounds %#', (shape) => {
    expect(runSpatialSearch(shape, INDEX, DATA)).toBe(
      EMPTY_SPATIAL_SEARCH_RESULT,
    )
  })

  it('uses exact geometry even if cached polygon bounds are absent', () => {
    const index: ExcavationPolygonIndex = new Map([
      [
        'assur',
        [
          excavationPolygon({
            polygonId: 'unbounded',
            siteId: 'assur',
            bounds: null,
            geometry: square(0, 0, 1),
          }),
        ],
      ],
    ])

    expect(
      runSpatialSearch({ type: 'viewport', bounds: [[-1, -1, 2, 2]] }, index, {
        summaries: new Map(),
        siteStatuses: DATA.siteStatuses,
      }).polygonIds,
    ).toEqual(['unbounded'])
  })
})

describe('spatialSearchDescription', () => {
  it.each<[SpatialSearchShape, string]>([
    [{ type: 'viewport', bounds: [[0, 0, 1, 1]] }, 'Current map view'],
    [{ type: 'bounding-box', bounds: [[0, 0, 1, 1]] }, 'Drawn rectangle'],
  ])('names %o', (shape, expected) => {
    expect(spatialSearchDescription(shape)).toBe(expected)
  })
})
