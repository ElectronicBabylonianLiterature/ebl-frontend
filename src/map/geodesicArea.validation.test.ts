import type { Geometry, Position } from 'geojson'
import { geodesicAreaSquareMetres } from 'map/geodesicArea'

const outer = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
  [0, 0],
]
const hole = [
  [0.25, 0.25],
  [0.75, 0.25],
  [0.75, 0.75],
  [0.25, 0.25],
]

it.each([
  [
    'an unclosed longitude',
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [1, 0],
    ],
  ],
  [
    'an unclosed latitude',
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ],
  ],
  [
    'a non-finite longitude',
    [
      [Number.POSITIVE_INFINITY, 0],
      [1, 0],
      [1, 1],
      [Number.POSITIVE_INFINITY, 0],
    ],
  ],
  [
    'an invalid latitude',
    [
      [0, 91],
      [1, 0],
      [1, 1],
      [0, 91],
    ],
  ],
] as const)('rejects %s in a polygon', (_label, positions) => {
  const geometry: Geometry = {
    type: 'Polygon',
    coordinates: [positions.map((position): Position => [...position])],
  }

  expect(geodesicAreaSquareMetres(geometry)).toBeNull()
})

it('rejects an invalid hole instead of returning the outer-ring area', () => {
  expect(
    geodesicAreaSquareMetres({
      type: 'Polygon',
      coordinates: [outer, hole.slice(0, -1)],
    }),
  ).toBeNull()
})

it('rejects an invalid multi-polygon part instead of returning a partial area', () => {
  expect(
    geodesicAreaSquareMetres({
      type: 'MultiPolygon',
      coordinates: [[outer], [hole.slice(0, -1)]],
    }),
  ).toBeNull()
})

it('rejects non-array positions received from malformed GeoJSON', () => {
  expect(
    geodesicAreaSquareMetres({
      type: 'Polygon',
      // @ts-expect-error Malformed runtime GeoJSON can contain null positions.
      coordinates: [[null, [1, 0], [1, 1], [0, 0]]],
    }),
  ).toBeNull()
})

it('preserves area for unwrapped dateline longitudes', () => {
  const shifted = outer.map(([longitude, latitude]) => [
    longitude + 180,
    latitude,
  ])
  expect(
    geodesicAreaSquareMetres({ type: 'Polygon', coordinates: [shifted] }),
  ).toBeCloseTo(
    geodesicAreaSquareMetres({ type: 'Polygon', coordinates: [outer] }) ?? 0,
    -3,
  )
})
