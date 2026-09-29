import {
  excavationPolygon,
  findspotMapDataDto as findspotMapData,
} from 'test-support/map-fixtures'
import type { ExcavationPolygonIndex } from 'map/excavationPolygonIndex'
import { aggregateFindspotMapData } from 'map/findspotMapDataSanitizer'
import { type SpatialSearchData, runSpatialSearch } from 'map/spatialSearch'

const geometry = {
  type: 'Polygon' as const,
  coordinates: [
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
      [0, 0],
    ],
  ],
}

function polygon(polygonId: string, siteId: string) {
  return excavationPolygon({
    polygonId,
    siteId,
    geometry,
    bounds: [0, 0, 1, 1],
  })
}

const SHAPE = { type: 'viewport' as const, bounds: [[-1, -1, 2, 2]] as const }

describe('spatial search data availability', () => {
  it('reports matched polygons by their actual site-data state', () => {
    const index: ExcavationPolygonIndex = new Map([
      ['assur', [polygon('available', 'assur')]],
      ['uruk', [polygon('loading', 'uruk')]],
      ['nineveh', [polygon('unavailable', 'nineveh')]],
    ])
    const summaries = aggregateFindspotMapData([
      findspotMapData({
        findspotId: 1,
        polygonIds: ['available'],
        accessibleFragmentCount: 4,
      }),
      findspotMapData({
        findspotId: 2,
        polygonIds: ['loading', 'unavailable'],
        accessibleFragmentCount: 99,
      }),
    ])
    const data: SpatialSearchData = {
      summaries,
      siteStatuses: new Map([
        ['assur', 'available'],
        ['uruk', 'loading'],
      ]),
    }

    expect(runSpatialSearch(SHAPE, index, data)).toEqual({
      polygonIds: ['available', 'loading', 'unavailable'],
      findspotIds: [1],
      mappedPolygonCount: 1,
      accessibleFragmentCount: 4,
      availablePolygonCount: 1,
      loadingPolygonCount: 1,
      unavailablePolygonCount: 1,
    })
  })

  it('counts one shared findspot and its fragments only once', () => {
    const index: ExcavationPolygonIndex = new Map([
      ['assur', [polygon('first', 'assur'), polygon('second', 'assur')]],
    ])
    const data: SpatialSearchData = {
      summaries: aggregateFindspotMapData([
        findspotMapData({
          findspotId: 4,
          polygonIds: ['first', 'second'],
          accessibleFragmentCount: 2,
        }),
      ]),
      siteStatuses: new Map([['assur', 'available']]),
    }

    expect(runSpatialSearch(SHAPE, index, data)).toMatchObject({
      polygonIds: ['first', 'second'],
      findspotIds: [4],
      mappedPolygonCount: 2,
      accessibleFragmentCount: 2,
    })
  })

  it('rejects conflicting duplicate findspots independent of input order', () => {
    const firstSummary = aggregateFindspotMapData([
      findspotMapData({
        findspotId: 4,
        polygonIds: ['first'],
        accessibleFragmentCount: 2,
      }),
    ]).get('first')
    const secondSummary = aggregateFindspotMapData([
      findspotMapData({
        findspotId: 4,
        polygonIds: ['second'],
        accessibleFragmentCount: 3,
      }),
    ]).get('second')
    if (!firstSummary || !secondSummary)
      throw new Error('missing fixture summary')

    const indexes: ExcavationPolygonIndex[] = [
      new Map([
        ['assur', [polygon('first', 'assur'), polygon('second', 'assur')]],
      ]),
      new Map([
        ['assur', [polygon('second', 'assur'), polygon('first', 'assur')]],
      ]),
    ]
    const data: SpatialSearchData = {
      summaries: new Map([
        ['second', secondSummary],
        ['first', firstSummary],
      ]),
      siteStatuses: new Map([['assur', 'available']]),
    }

    for (const index of indexes) {
      expect(runSpatialSearch(SHAPE, index, data)).toMatchObject({
        findspotIds: [],
        accessibleFragmentCount: 0,
      })
    }
  })
})
