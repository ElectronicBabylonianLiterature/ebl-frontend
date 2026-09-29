import type { Position } from 'geojson'
import {
  drawnRectangleBounds,
  geometryOfBounds,
  viewportSearchBounds,
  wrapLongitude,
} from 'map/spatialBounds'

describe('wrapLongitude', () => {
  it.each([
    [43, 43],
    [403, 43],
    [-317, 43],
    [180, -180],
  ])('wraps %s to %s', (longitude, expected) => {
    expect(wrapLongitude(longitude)).toBe(expected)
  })
})

describe('viewportSearchBounds', () => {
  it('normalizes a repeated world copy', () => {
    expect(viewportSearchBounds(403, 35, 404, 36)).toEqual([[43, 35, 44, 36]])
  })

  it('splits a view crossing the antimeridian', () => {
    expect(viewportSearchBounds(170, -10, 190, 10)).toEqual([
      [170, -10, 180, 10],
      [-180, -10, -170, 10],
    ])
    expect(viewportSearchBounds(170, -10, -170, 10)).toEqual([
      [170, -10, 180, 10],
      [-180, -10, -170, 10],
    ])
  })

  it('reduces a full-world view to one canonical box', () => {
    expect(viewportSearchBounds(-200, -60, 200, 60)).toEqual([
      [-180, -60, 180, 60],
    ])
  })

  it.each([
    [0, 0, 0, 1],
    [0, 1, 1, 1],
    [0, -91, 1, 1],
    [0, 0, Number.NaN, 1],
  ])('rejects invalid bounds %#', (west, south, east, north) => {
    expect(viewportSearchBounds(west, south, east, north)).toBeNull()
  })
})

describe('drawnRectangleBounds', () => {
  it('uses the shortest path across the antimeridian', () => {
    expect(drawnRectangleBounds([179, -2], [-179, 2])).toEqual([
      [179, -2, 180, 2],
      [-180, -2, -179, 2],
    ])
  })

  it('normalizes repeated copies and either drawing direction', () => {
    expect(drawnRectangleBounds([404, 36], [403, 35])).toEqual([
      [43, 35, 44, 36],
    ])
  })

  it.each<[Position, Position]>([
    [
      [0, 0],
      [0, 1],
    ],
    [
      [0, 0],
      [1, 0],
    ],
    [
      [0, 0],
      [360, 1],
    ],
    [
      [Number.NaN, 0],
      [1, 1],
    ],
  ])('rejects a degenerate rectangle %#', (first, second) => {
    expect(drawnRectangleBounds(first, second)).toBeNull()
  })
})

describe('geometryOfBounds', () => {
  it('returns a polygon for one box and a multi-polygon for a split box', () => {
    expect(geometryOfBounds([[0, 0, 1, 1]])?.type).toBe('Polygon')
    expect(
      geometryOfBounds([
        [179, 0, 180, 1],
        [-180, 0, -179, 1],
      ])?.type,
    ).toBe('MultiPolygon')
  })

  it('rejects an absent or unexpectedly fragmented extent', () => {
    expect(geometryOfBounds([])).toBeNull()
    expect(
      geometryOfBounds([
        [0, 0, 1, 1],
        [2, 0, 3, 1],
        [4, 0, 5, 1],
      ]),
    ).toBeNull()
  })
})
