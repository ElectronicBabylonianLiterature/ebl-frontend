import type { Geometry } from 'geojson'
import {
  boundingBoxRing,
  boundingBoxesIntersect,
  geometryIntersectsBoundingBox,
  geometryIntersectsRing,
  isPositionInBoundingBox,
  isPositionInRing,
  segmentsIntersect,
} from './spatialPredicates'

const UNIT_SQUARE = boundingBoxRing([0, 0, 1, 1])

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

describe('boundingBoxesIntersect', () => {
  it.each([
    ['overlapping', [0, 0, 2, 2], [1, 1, 3, 3], true],
    ['touching at an edge', [0, 0, 1, 1], [1, 0, 2, 1], true],
    ['east of', [0, 0, 1, 1], [2, 0, 3, 1], false],
    ['west of', [2, 0, 3, 1], [0, 0, 1, 1], false],
    ['north of', [0, 0, 1, 1], [0, 2, 1, 3], false],
    ['south of', [0, 2, 1, 3], [0, 0, 1, 1], false],
  ])('reports %s as %s', (_name, left, right, expected) => {
    expect(
      boundingBoxesIntersect(
        left as [number, number, number, number],
        right as [number, number, number, number],
      ),
    ).toBe(expected)
  })
})

describe('isPositionInBoundingBox', () => {
  it.each([
    [[0.5, 0.5], true],
    [[0, 0], true],
    [[1.5, 0.5], false],
    [[-0.5, 0.5], false],
    [[0.5, 1.5], false],
    [[0.5, -0.5], false],
  ])('places %s inside → %s', (position, expected) => {
    expect(
      isPositionInBoundingBox(position as [number, number], [0, 0, 1, 1]),
    ).toBe(expected)
  })
})

describe('isPositionInRing', () => {
  it('accepts an interior point and rejects an exterior one', () => {
    expect(isPositionInRing([0.5, 0.5], UNIT_SQUARE)).toBe(true)
    expect(isPositionInRing([5, 5], UNIT_SQUARE)).toBe(false)
  })

  it('rejects a point level with the ring but outside it', () => {
    expect(isPositionInRing([-1, 0.5], UNIT_SQUARE)).toBe(false)
    expect(isPositionInRing([2, 0.5], UNIT_SQUARE)).toBe(false)
  })
})

describe('segmentsIntersect', () => {
  it.each([
    ['crossing', [0, 0], [2, 2], [0, 2], [2, 0], true],
    ['disjoint', [0, 0], [1, 0], [0, 2], [1, 2], false],
    ['touching endpoint', [0, 0], [1, 1], [1, 1], [2, 0], true],
    ['collinear overlapping', [0, 0], [2, 0], [1, 0], [3, 0], true],
    ['collinear disjoint', [0, 0], [1, 0], [2, 0], [3, 0], false],
    ['t-junction', [0, 0], [2, 0], [1, 0], [1, 2], true],
    ['endpoint on other', [1, 1], [3, 3], [0, 2], [2, 2], true],
  ])('reports %s as %s', (_name, a, b, c, d, expected) => {
    expect(
      segmentsIntersect(
        a as [number, number],
        b as [number, number],
        c as [number, number],
        d as [number, number],
      ),
    ).toBe(expected)
  })
})

describe('geometryIntersectsRing', () => {
  it('matches a polygon fully inside the search ring', () => {
    expect(geometryIntersectsRing(square(0.2, 0.2, 0.2), UNIT_SQUARE)).toBe(
      true,
    )
  })

  it('matches a polygon that contains the search ring', () => {
    expect(geometryIntersectsRing(square(-5, -5, 10), UNIT_SQUARE)).toBe(true)
  })

  it('matches a polygon that crosses an edge', () => {
    expect(geometryIntersectsRing(square(0.5, 0.5, 2), UNIT_SQUARE)).toBe(true)
  })

  it('rejects a disjoint polygon', () => {
    expect(geometryIntersectsRing(square(10, 10, 1), UNIT_SQUARE)).toBe(false)
  })

  it('matches any part of a multi-polygon', () => {
    const geometry: Geometry = {
      type: 'MultiPolygon',
      coordinates: [
        (square(10, 10, 1) as { coordinates: number[][][] }).coordinates,
        (square(0.2, 0.2, 0.2) as { coordinates: number[][][] }).coordinates,
      ],
    }

    expect(geometryIntersectsRing(geometry, UNIT_SQUARE)).toBe(true)
  })

  it.each<Geometry>([
    { type: 'Point', coordinates: [0.5, 0.5] },
    {
      type: 'LineString',
      coordinates: [
        [0, 0],
        [1, 1],
      ],
    },
    { type: 'Polygon', coordinates: [] },
    { type: 'MultiPolygon', coordinates: [[]] },
  ])('rejects unsupported geometry %#', (geometry) => {
    expect(geometryIntersectsRing(geometry, UNIT_SQUARE)).toBe(false)
  })

  it('rejects a polygon whose outer ring is empty', () => {
    expect(
      geometryIntersectsRing(
        { type: 'Polygon', coordinates: [[]] },
        UNIT_SQUARE,
      ),
    ).toBe(false)
  })
})

describe('geometryIntersectsBoundingBox', () => {
  it('uses the box as the search ring', () => {
    expect(
      geometryIntersectsBoundingBox(square(0.2, 0.2, 0.2), [0, 0, 1, 1]),
    ).toBe(true)
    expect(geometryIntersectsBoundingBox(square(9, 9, 0.2), [0, 0, 1, 1])).toBe(
      false,
    )
  })
})
