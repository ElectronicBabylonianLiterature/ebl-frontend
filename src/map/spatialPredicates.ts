import type { Geometry, Position } from 'geojson'
import type { BoundingBox } from 'map/mapGeometry'

export type Ring = readonly Position[]

function isFinitePosition(position: Position): boolean {
  return (
    Number.isFinite(position[0]) &&
    Number.isFinite(position[1]) &&
    position[1] >= -90 &&
    position[1] <= 90
  )
}

function samePosition(left: Position, right: Position): boolean {
  return left[0] === right[0] && left[1] === right[1]
}

function unwrapLongitude(longitude: number, reference: number): number {
  return longitude + 360 * Math.round((reference - longitude) / 360)
}

function unwrapRing(ring: Ring, reference: number): Ring {
  const result: Position[] = []
  for (const position of ring) {
    const previous = result[result.length - 1]
    result.push([
      unwrapLongitude(position[0], previous?.[0] ?? reference),
      position[1],
    ])
  }
  return result
}

function ringArea(ring: Ring): number {
  return ring.slice(0, -1).reduce((area, [longitude, latitude], index) => {
    const [nextLongitude, nextLatitude] = ring[index + 1]
    return area + longitude * nextLatitude - nextLongitude * latitude
  }, 0)
}

function validRing(ring: Ring): boolean {
  return (
    ring.length >= 4 &&
    ring.every(isFinitePosition) &&
    samePosition(ring[0], ring[ring.length - 1]) &&
    ringArea(unwrapRing(ring, ring[0][0])) !== 0
  )
}

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
  if (!isFinitePosition(position) || !validRing(ring)) return false
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
  if (![a, b, c, d].every(isFinitePosition)) return false
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
  return left
    .slice(0, -1)
    .some((position, index) =>
      right
        .slice(0, -1)
        .some((other, otherIndex) =>
          segmentsIntersect(
            position,
            left[index + 1],
            other,
            right[otherIndex + 1],
          ),
        ),
    )
}

function polygonsOf(geometry: Geometry): readonly (readonly Ring[])[] {
  if (geometry.type === 'Polygon') return [geometry.coordinates]
  return geometry.type === 'MultiPolygon' ? geometry.coordinates : []
}

function polygonIntersectsRing(
  rings: readonly Ring[],
  searchRing: Ring,
): boolean {
  if (rings.length === 0 || !rings.every(validRing)) return false
  const [outer, ...holes] = rings
  if (rings.some((ring) => ringsIntersect(ring, searchRing))) return true
  if (outer.slice(0, -1).some((point) => isPositionInRing(point, searchRing))) {
    return true
  }
  return searchRing
    .slice(0, -1)
    .some(
      (point) =>
        isPositionInRing(point, outer) &&
        !holes.some((hole) => isPositionInRing(point, hole)),
    )
}

export function geometryIntersectsRing(
  geometry: Geometry,
  searchRing: Ring,
): boolean {
  if (!validRing(searchRing)) return false
  const unwrappedSearch = unwrapRing(searchRing, searchRing[0][0])
  const longitudes = unwrappedSearch.map(([longitude]) => longitude)
  const reference = (Math.min(...longitudes) + Math.max(...longitudes)) / 2

  return polygonsOf(geometry).some((rings) =>
    polygonIntersectsRing(
      rings.map((ring) => unwrapRing(ring, reference)),
      unwrappedSearch,
    ),
  )
}

export function geometryIntersectsBoundingBox(
  geometry: Geometry,
  box: BoundingBox,
): boolean {
  return geometryIntersectsRing(geometry, boundingBoxRing(box))
}
