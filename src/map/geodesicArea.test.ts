import type { Geometry } from 'geojson'
import {
  EARTH_RADIUS_METRES,
  geodesicAreaSquareKm,
  geodesicAreaSquareMetres,
} from './geodesicArea'

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

describe('geodesicAreaSquareMetres', () => {
  it('matches the analytic area of a one-degree band at the equator', () => {
    const expected =
      ((Math.PI / 180) *
        EARTH_RADIUS_METRES *
        EARTH_RADIUS_METRES *
        (Math.sin((Math.PI / 180) * 1) - Math.sin(0))) /
      1

    expect(geodesicAreaSquareMetres(square(0, 0, 1)) as number).toBeCloseTo(
      expected,
      -3,
    )
  })

  it('shrinks with latitude for an identical degree extent', () => {
    const equator = geodesicAreaSquareMetres(square(0, 0, 1)) as number
    const midLatitude = geodesicAreaSquareMetres(square(0, 60, 1)) as number

    expect(midLatitude).toBeLessThan(equator)
    expect(midLatitude / equator).toBeCloseTo(0.5, 1)
  })

  it('is independent of ring winding order', () => {
    const clockwise: Geometry = {
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [0, 1],
          [1, 1],
          [1, 0],
          [0, 0],
        ],
      ],
    }

    expect(geodesicAreaSquareMetres(clockwise)).toBeCloseTo(
      geodesicAreaSquareMetres(square(0, 0, 1)) as number,
      -3,
    )
  })

  it('subtracts holes from the outer ring', () => {
    const withHole: Geometry = {
      type: 'Polygon',
      coordinates: [
        square(0, 0, 1).type === 'Polygon'
          ? (square(0, 0, 1) as { coordinates: number[][][] }).coordinates[0]
          : [],
        [
          [0.25, 0.25],
          [0.75, 0.25],
          [0.75, 0.75],
          [0.25, 0.75],
          [0.25, 0.25],
        ],
      ],
    }
    const solid = geodesicAreaSquareMetres(square(0, 0, 1)) as number

    expect(geodesicAreaSquareMetres(withHole) as number).toBeLessThan(solid)
    expect(geodesicAreaSquareMetres(withHole) as number).toBeGreaterThan(0)
  })

  it('sums the parts of a multi-polygon', () => {
    const single = geodesicAreaSquareMetres(square(0, 0, 1)) as number
    const multi: Geometry = {
      type: 'MultiPolygon',
      coordinates: [
        (square(0, 0, 1) as { coordinates: number[][][] }).coordinates,
        (square(10, 0, 1) as { coordinates: number[][][] }).coordinates,
      ],
    }

    expect(geodesicAreaSquareMetres(multi) as number).toBeCloseTo(
      single * 2,
      -3,
    )
  })
})

describe('degenerate geometry', () => {
  it.each([
    ['a point', { type: 'Point', coordinates: [0, 0] }],
    [
      'a line',
      {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [1, 1],
        ],
      },
    ],
    ['an empty polygon', { type: 'Polygon', coordinates: [] }],
    [
      'a ring with too few positions',
      {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [1, 0],
            [0, 0],
          ],
        ],
      },
    ],
    [
      'a zero-area ring',
      {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [0, 0],
            [0, 0],
            [0, 0],
          ],
        ],
      },
    ],
    [
      'a ring with non-numeric coordinates',
      {
        type: 'Polygon',
        coordinates: [
          [
            ['a', 0],
            [1, 0],
            [1, 1],
            ['a', 0],
          ],
        ],
      },
    ],
    ['an empty multi-polygon', { type: 'MultiPolygon', coordinates: [] }],
    ['a geometry collection', { type: 'GeometryCollection', geometries: [] }],
  ])('returns null for %s', (_label, geometry) => {
    expect(geodesicAreaSquareMetres(geometry as Geometry)).toBeNull()
  })
})

describe('geodesicAreaSquareKm', () => {
  it('converts square metres to square kilometres', () => {
    const metres = geodesicAreaSquareMetres(square(0, 0, 1)) as number

    expect(geodesicAreaSquareKm(square(0, 0, 1)) as number).toBeCloseTo(
      metres / 1_000_000,
      6,
    )
  })

  it('propagates null for unusable geometry', () => {
    expect(
      geodesicAreaSquareKm({ type: 'Point', coordinates: [0, 0] }),
    ).toBeNull()
  })
})
