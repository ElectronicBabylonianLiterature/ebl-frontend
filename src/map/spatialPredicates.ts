import type { Geometry, Position } from 'geojson'
import type { BoundingBox } from './mapGeometry'

export type Ring = readonly Position[]

export function boundingBoxesIntersect(
  left: BoundingBox,
  right: BoundingBox,
): boolean {
  return !(
    left[2] < right[0] ||
    right[2] < left[0] ||
    left[3] < right[1] ||
    right[3] < left[1]
  )
}

export function isPositionInBoundingBox(
  [longitude, latitude]: Position,
  [west, south, east, north]: BoundingBox,
): boolean {
  return (
    longitude >= west &&
    longitude <= east &&
    latitude >= south &&
    latitude <= north
  )
}
export function isPositionInRing(position: Position, ring: Ring): boolean {
  const [longitude, latitude] = position
  let isInside = false

  for (
    let index = 0, previous = ring.length - 1;
    index < ring.length;
    index++
  ) {
    const [currentLongitude, currentLatitude] = ring[index]
    const [previousLongitude, previousLatitude] = ring[previous]

    const straddles = currentLatitude > latitude !== previousLatitude > latitude
    if (
      straddles &&
      longitude <
        ((previousLongitude - currentLongitude) *
          (latitude - currentLatitude)) /
          (previousLatitude - currentLatitude) +
          currentLongitude
    ) {
      isInside = !isInside
    }
    previous = index
  }

  return isInside
}

function orientation(a: Position, b: Position, c: Position): number {
  return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
}

function isBetween(a: Position, b: Position, c: Position): boolean {
  return (
    Math.min(a[0], c[0]) <= b[0] &&
    b[0] <= Math.max(a[0], c[0]) &&
    Math.min(a[1], c[1]) <= b[1] &&
    b[1] <= Math.max(a[1], c[1])
  )
}

export function segmentsIntersect(
  a: Position,
  b: Position,
  c: Position,
  d: Position,
): boolean {
  const first = orientation(a, b, c)
  const second = orientation(a, b, d)
  const third = orientation(c, d, a)
  const fourth = orientation(c, d, b)

  if (first * second < 0 && third * fourth < 0) return true

  return (
    (first === 0 && isBetween(a, c, b)) ||
    (second === 0 && isBetween(a, d, b)) ||
    (third === 0 && isBetween(c, a, d)) ||
    (fourth === 0 && isBetween(c, b, d))
  )
}

export function boundingBoxRing([west, south, east, north]: BoundingBox): Ring {
  return [
    [west, south],
    [east, south],
    [east, north],
    [west, north],
    [west, south],
  ]
}

function ringsIntersect(left: Ring, right: Ring): boolean {
  for (let index = 0; index < left.length - 1; index++) {
    for (let other = 0; other < right.length - 1; other++) {
      if (
        segmentsIntersect(
          left[index],
          left[index + 1],
          right[other],
          right[other + 1],
        )
      ) {
        return true
      }
    }
  }
  return false
}

function outerRingsOf(geometry: Geometry): readonly Ring[] {
  if (geometry.type === 'Polygon') {
    return geometry.coordinates.length > 0
      ? [geometry.coordinates[0] as Ring]
      : []
  }
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.flatMap((rings) =>
      rings.length > 0 ? [rings[0] as Ring] : [],
    )
  }
  return []
}
export function geometryIntersectsRing(
  geometry: Geometry,
  searchRing: Ring,
): boolean {
  return outerRingsOf(geometry).some(
    (ring) =>
      ring.length > 0 &&
      (ring.some((position) => isPositionInRing(position, searchRing)) ||
        searchRing.some((position) => isPositionInRing(position, ring)) ||
        ringsIntersect(ring, searchRing)),
  )
}

export function geometryIntersectsBoundingBox(
  geometry: Geometry,
  box: BoundingBox,
): boolean {
  return geometryIntersectsRing(geometry, boundingBoxRing(box))
}
