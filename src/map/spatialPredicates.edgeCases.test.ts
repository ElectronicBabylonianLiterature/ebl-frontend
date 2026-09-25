import type { Geometry } from 'geojson'
import { geometryIntersectsBoundingBox } from 'map/spatialPredicates'

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

describe('polygon holes and wrapped worlds', () => {
  const polygonWithHole: Geometry = {
    type: 'Polygon',
    coordinates: [
      [
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
        [0, 0],
      ],
      [
        [2, 2],
        [8, 2],
        [8, 8],
        [2, 8],
        [2, 2],
      ],
    ],
  }

  it('rejects a search contained entirely by a polygon hole', () => {
    expect(geometryIntersectsBoundingBox(polygonWithHole, [3, 3, 4, 4])).toBe(
      false,
    )
  })

  it('matches polygon material and hole boundaries', () => {
    expect(
      geometryIntersectsBoundingBox(polygonWithHole, [1, 1, 1.5, 1.5]),
    ).toBe(true)
    expect(geometryIntersectsBoundingBox(polygonWithHole, [1, 3, 3, 4])).toBe(
      true,
    )
  })

  it('matches both canonical sides of an antimeridian polygon', () => {
    const geometry: Geometry = {
      type: 'Polygon',
      coordinates: [
        [
          [179, -1],
          [-179, -1],
          [-179, 1],
          [179, 1],
          [179, -1],
        ],
      ],
    }

    expect(
      geometryIntersectsBoundingBox(geometry, [179.5, -0.5, 180, 0.5]),
    ).toBe(true)
    expect(
      geometryIntersectsBoundingBox(geometry, [-180, -0.5, -179.5, 0.5]),
    ).toBe(true)
    expect(geometryIntersectsBoundingBox(geometry, [0, -0.5, 1, 0.5])).toBe(
      false,
    )
  })

  it('normalizes polygon coordinates from a repeated world', () => {
    expect(
      geometryIntersectsBoundingBox(
        square(403, 35, 1),
        [43.2, 35.2, 43.8, 35.8],
      ),
    ).toBe(true)
  })
})

describe('invalid geometry', () => {
  it.each<Geometry>([
    {
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 1],
        ],
      ],
    },
    {
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [1, 0],
          [2, 0],
          [0, 0],
        ],
      ],
    },
    {
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [1, 0],
          [1, Number.NaN],
          [0, 0],
        ],
      ],
    },
  ])('fails closed for malformed rings %#', (geometry) => {
    expect(geometryIntersectsBoundingBox(geometry, [0, 0, 1, 1])).toBe(false)
  })
})
