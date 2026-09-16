import type { Geometry } from 'geojson'
import { excavationPolygon, findspotMapData } from 'test-support/map-fixtures'
import { aggregateFindspotMapData } from './findspotMapData'
import type { ExcavationPolygonIndex } from './excavationPolygonIndex'
import {
  EMPTY_SPATIAL_SEARCH_RESULT,
  type SpatialSearchShape,
  runSpatialSearch,
  spatialSearchDescription,
} from './spatialSearch'

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

const SUMMARIES = aggregateFindspotMapData([
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
])

describe('runSpatialSearch', () => {
  it('collects mapped findspots inside the viewport', () => {
    expect(
      runSpatialSearch(
        { type: 'viewport', bounds: [-1, -1, 2, 2] },
        INDEX,
        SUMMARIES,
      ),
    ).toEqual({
      polygonIds: ['near'],
      findspotIds: [2, 7],
      mappedPolygonCount: 1,
      accessibleFragmentCount: 8,
    })
  })

  it('treats a drawn rectangle the same way', () => {
    expect(
      runSpatialSearch(
        { type: 'bounding-box', bounds: [-1, -1, 2, 2] },
        INDEX,
        SUMMARIES,
      ).polygonIds,
    ).toEqual(['near'])
  })

  it('matches a drawn polygon and closes an open ring', () => {
    expect(
      runSpatialSearch(
        {
          type: 'polygon',
          positions: [
            [-1, -1],
            [2, -1],
            [2, 2],
          ],
        },
        INDEX,
        SUMMARIES,
      ).polygonIds,
    ).toEqual(['near'])
  })

  it('accepts an already-closed drawn ring', () => {
    expect(
      runSpatialSearch(
        {
          type: 'polygon',
          positions: [
            [-1, -1],
            [2, -1],
            [2, 2],
            [-1, -1],
          ],
        },
        INDEX,
        SUMMARIES,
      ).polygonIds,
    ).toEqual(['near'])
  })

  it('searches the bounds of a selected excavation area', () => {
    expect(
      runSpatialSearch(
        { type: 'excavation-area', polygonId: 'near' },
        INDEX,
        SUMMARIES,
      ).polygonIds,
    ).toEqual(['near'])
  })

  it('returns nothing for an unknown excavation area', () => {
    expect(
      runSpatialSearch(
        { type: 'excavation-area', polygonId: 'missing' },
        INDEX,
        SUMMARIES,
      ),
    ).toBe(EMPTY_SPATIAL_SEARCH_RESULT)
  })

  it('returns nothing for an excavation area without bounds', () => {
    const index: ExcavationPolygonIndex = new Map([
      ['assur', [excavationPolygon({ polygonId: 'unbounded', bounds: null })]],
    ])

    expect(
      runSpatialSearch(
        { type: 'excavation-area', polygonId: 'unbounded' },
        index,
        SUMMARIES,
      ),
    ).toBe(EMPTY_SPATIAL_SEARCH_RESULT)
  })

  it('returns nothing for a drawn shape with too few vertices', () => {
    expect(
      runSpatialSearch(
        {
          type: 'polygon',
          positions: [
            [0, 0],
            [1, 1],
          ],
        },
        INDEX,
        SUMMARIES,
      ),
    ).toBe(EMPTY_SPATIAL_SEARCH_RESULT)
  })

  it('skips polygons without bounds during the pre-filter', () => {
    const index: ExcavationPolygonIndex = new Map([
      [
        'assur',
        [
          excavationPolygon({
            polygonId: 'unbounded',
            bounds: null,
            geometry: square(0, 0, 1),
          }),
        ],
      ],
    ])

    expect(
      runSpatialSearch(
        { type: 'viewport', bounds: [-1, -1, 2, 2] },
        index,
        SUMMARIES,
      ).polygonIds,
    ).toEqual([])
  })

  it('reports matched but unmapped polygons without inventing findspots', () => {
    expect(
      runSpatialSearch(
        { type: 'viewport', bounds: [-1, -1, 30, 30] },
        INDEX,
        new Map(),
      ),
    ).toEqual({
      polygonIds: ['far', 'near'],
      findspotIds: [],
      mappedPolygonCount: 0,
      accessibleFragmentCount: 0,
    })
  })

  it('deduplicates findspots shared between matched polygons', () => {
    const summaries = aggregateFindspotMapData([
      findspotMapData({
        findspotId: 4,
        polygonIds: ['near', 'far'],
        accessibleFragmentCount: 2,
      }),
    ])

    expect(
      runSpatialSearch(
        { type: 'viewport', bounds: [-1, -1, 30, 30] },
        INDEX,
        summaries,
      ),
    ).toMatchObject({ findspotIds: [4], mappedPolygonCount: 2 })
  })
})

describe('spatialSearchDescription', () => {
  it.each<[SpatialSearchShape, string]>([
    [{ type: 'viewport', bounds: [0, 0, 1, 1] }, 'Current map view'],
    [{ type: 'bounding-box', bounds: [0, 0, 1, 1] }, 'Drawn rectangle'],
    [{ type: 'polygon', positions: [] }, 'Drawn area'],
    [{ type: 'excavation-area', polygonId: 'a' }, 'Selected excavation area'],
  ])('names %o', (shape, expected) => {
    expect(spatialSearchDescription(shape)).toBe(expected)
  })
})
