import type { Geometry, Position } from 'geojson'

export const EARTH_RADIUS_METRES = 6371008.8
const SQUARE_METRES_PER_SQUARE_KM = 1_000_000

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

function isRing(value: unknown): value is Position[] {
  return (
    Array.isArray(value) &&
    value.length >= 4 &&
    value.every(
      (position) =>
        Array.isArray(position) &&
        typeof position[0] === 'number' &&
        typeof position[1] === 'number' &&
        Number.isFinite(position[0]) &&
        Number.isFinite(position[1]),
    )
  )
}

function ringArea(ring: readonly Position[]): number {
  if (ring.length < 4) return 0

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

function polygonArea(rings: unknown): number {
  if (!Array.isArray(rings) || !isRing(rings[0])) return 0

  const [outer, ...holes] = rings
  const outerArea = Math.abs(ringArea(outer as Position[]))
  const holeArea = holes.reduce<number>(
    (total, hole) => total + (isRing(hole) ? Math.abs(ringArea(hole)) : 0),
    0,
  )

  return Math.max(outerArea - holeArea, 0)
}

export function geodesicAreaSquareMetres(geometry: Geometry): number | null {
  const area =
    geometry.type === 'Polygon'
      ? polygonArea(geometry.coordinates)
      : geometry.type === 'MultiPolygon' && Array.isArray(geometry.coordinates)
        ? geometry.coordinates.reduce<number>(
            (total, rings) => total + polygonArea(rings),
            0,
          )
        : 0

  return Number.isFinite(area) && area > 0 ? area : null
}

export function geodesicAreaSquareKm(geometry: Geometry): number | null {
  const area = geodesicAreaSquareMetres(geometry)
  return area === null ? null : area / SQUARE_METRES_PER_SQUARE_KM
}
