import {
  boundingBoxOfFeatures,
  boundingBoxOfGeometry,
  boundingBoxOfPositions,
  centroidOf,
  collectPositions,
  firstPosition,
  unionBoundingBoxes,
} from './mapGeometry'
import { polygonFeature } from 'test-support/map-fixtures'

describe('centroidOf', () => {
  it('returns null for an empty list', () => {
    expect(centroidOf([])).toBeNull()
  })

  it('averages latitude and longitude', () => {
    expect(
      centroidOf([
        { latitude: 0, longitude: 0 },
        { latitude: 2, longitude: 4 },
      ]),
    ).toEqual({ latitude: 1, longitude: 2 })
  })
})

describe('collectPositions', () => {
  it('ignores non-array input', () => {
    expect(collectPositions('not-coordinates')).toEqual([])
  })

  it('flattens nested rings', () => {
    expect(
      collectPositions([
        [
          [1, 2],
          [3, 4],
        ],
      ]),
    ).toEqual([
      [1, 2],
      [3, 4],
    ])
  })
})

describe('boundingBoxOfPositions', () => {
  it('returns null without positions', () => {
    expect(boundingBoxOfPositions([])).toBeNull()
  })

  it('spans every position', () => {
    expect(
      boundingBoxOfPositions([
        [1, 2],
        [-1, 5],
      ]),
    ).toEqual([-1, 2, 1, 5])
  })
})

describe('boundingBoxOfGeometry', () => {
  it('covers a polygon ring', () => {
    expect(
      boundingBoxOfGeometry(polygonFeature('a', 'assur').geometry),
    ).toEqual([43.25, 35.45, 43.26, 35.46])
  })

  it('unions a geometry collection', () => {
    expect(
      boundingBoxOfGeometry({
        type: 'GeometryCollection',
        geometries: [
          { type: 'Point', coordinates: [1, 1] },
          { type: 'Point', coordinates: [3, 5] },
        ],
      }),
    ).toEqual([1, 1, 3, 5])
  })

  it('returns null for an empty geometry', () => {
    expect(
      boundingBoxOfGeometry({ type: 'MultiPoint', coordinates: [] }),
    ).toBeNull()
  })
})

describe('boundingBoxOfFeatures', () => {
  it('returns null without features', () => {
    expect(boundingBoxOfFeatures([])).toBeNull()
  })

  it('unions feature bounds', () => {
    expect(
      boundingBoxOfFeatures([
        polygonFeature('a', 'assur'),
        {
          type: 'Feature',
          properties: {},
          geometry: { type: 'Point', coordinates: [40, 30] },
        },
      ]),
    ).toEqual([40, 30, 43.26, 35.46])
  })
})

describe('unionBoundingBoxes', () => {
  it('skips null entries', () => {
    expect(unionBoundingBoxes([null, [0, 0, 1, 1], null])).toEqual([0, 0, 1, 1])
  })

  it('returns null when everything is null', () => {
    expect(unionBoundingBoxes([null])).toBeNull()
  })
})

describe('firstPosition', () => {
  it('reads a point position', () => {
    expect(firstPosition({ type: 'Point', coordinates: [7, 8] })).toEqual([
      7, 8,
    ])
  })

  it('reads the first position of a geometry collection', () => {
    expect(
      firstPosition({
        type: 'GeometryCollection',
        geometries: [
          { type: 'GeometryCollection', geometries: [] },
          { type: 'Point', coordinates: [9, 10] },
        ],
      }),
    ).toEqual([9, 10])
  })

  it('returns null without coordinates', () => {
    expect(firstPosition({ type: 'MultiPoint', coordinates: [] })).toBeNull()
  })
})
