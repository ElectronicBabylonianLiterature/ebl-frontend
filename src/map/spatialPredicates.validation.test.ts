import type { Geometry, Position } from 'geojson'
import {
  boundingBoxRing,
  geometryIntersectsRing,
  isPositionInRing,
  segmentsIntersect,
} from 'map/spatialPredicates'

const UNIT_SQUARE = boundingBoxRing([0, 0, 1, 1])
const POLYGON: Geometry = {
  type: 'Polygon',
  coordinates: [Array.from(UNIT_SQUARE)],
}

it.each<Position>([
  [Number.NaN, 0],
  [0, Number.POSITIVE_INFINITY],
  [0, -91],
  [0, 91],
])('rejects invalid geographic positions %p', (...position) => {
  expect(isPositionInRing(position, UNIT_SQUARE)).toBe(false)
  expect(segmentsIntersect([0, 0], [1, 1], position, [0, 1])).toBe(false)
})

it.each([
  { name: 'empty', ring: [] },
  { name: 'open', ring: UNIT_SQUARE.slice(0, -1) },
  { name: 'zero-area', ring: boundingBoxRing([0, 0, 0, 1]) },
])('rejects a $name search ring', ({ ring }) => {
  expect(isPositionInRing([0.5, 0.5], ring)).toBe(false)
  expect(geometryIntersectsRing(POLYGON, ring)).toBe(false)
})
