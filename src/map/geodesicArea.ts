import type { Geometry, Position } from 'geojson'

export const EARTH_RADIUS_METRES = 6371008.8
const SQUARE_METRES_PER_SQUARE_KM = 1_000_000

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

function isFinitePosition(value: unknown): value is Position {
  if (!Array.isArray(value)) return false
  const [longitude, latitude] = value
  return (
    typeof longitude === 'number' &&
    typeof latitude === 'number' &&
    Number.isFinite(longitude) &&
    Number.isFinite(latitude) &&
    Math.abs(latitude) <= 90
  )
}

function isRing(value: unknown): value is Position[] {
  if (
    !Array.isArray(value) ||
    value.length < 4 ||
    !value.every(isFinitePosition)
  )
    return false
  const first = value[0]
  const last = value[value.length - 1]
  return first[0] === last[0] && first[1] === last[1]
}

function ringArea(ring: readonly Position[]): number {
  let total = 0
  for (let index = 0; index < ring.length - 1; index += 1) {
    const [lowerLongitude, lowerLatitude] = ring[index]
    const [upperLongitude, upperLatitude] = ring[index + 1]

    total +=
      (toRadians(upperLongitude) - toRadians(lowerLongitude)) *
      (2 +
        Math.sin(toRadians(lowerLatitude)) +
        Math.sin(toRadians(upperLatitude)))
  }

  return (total * EARTH_RADIUS_METRES * EARTH_RADIUS_METRES) / 2
}

function polygonArea(rings: unknown): number | null {
  if (!Array.isArray(rings) || rings.length === 0 || !rings.every(isRing))
    return null

  const [outer, ...holes] = rings
  const outerArea = Math.abs(ringArea(outer))
  const holeArea = holes.reduce<number>(
    (total, hole) => total + Math.abs(ringArea(hole)),
    0,
  )

  return Math.max(outerArea - holeArea, 0)
}

function multiPolygonArea(polygons: unknown[]): number | null {
  let total = 0
  for (const polygon of polygons) {
    const area = polygonArea(polygon)
    if (area === null) return null
    total += area
  }
  return total
}

export function geodesicAreaSquareMetres(geometry: Geometry): number | null {
  const area =
    geometry.type === 'Polygon'
      ? polygonArea(geometry.coordinates)
      : geometry.type === 'MultiPolygon' && Array.isArray(geometry.coordinates)
        ? multiPolygonArea(geometry.coordinates)
        : null

  return area !== null && Number.isFinite(area) && area > 0 ? area : null
}

export function geodesicAreaSquareKm(geometry: Geometry): number | null {
  const area = geodesicAreaSquareMetres(geometry)
  return area === null ? null : area / SQUARE_METRES_PER_SQUARE_KM
}
