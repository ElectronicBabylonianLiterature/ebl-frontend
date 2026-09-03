import type { Position } from 'geojson'
import { EARTH_RADIUS_METRES } from './geodesicArea'

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

function isPosition(value: unknown): value is Position {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    Number.isFinite(value[0]) &&
    Number.isFinite(value[1])
  )
}
export function geodesicDistanceMetres(
  from: Position,
  to: Position,
): number | null {
  if (!isPosition(from) || !isPosition(to)) return null

  const fromLatitude = toRadians(from[1])
  const toLatitude = toRadians(to[1])
  const deltaLatitude = toLatitude - fromLatitude
  const deltaLongitude = toRadians(to[0] - from[0])

  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(fromLatitude) *
      Math.cos(toLatitude) *
      Math.sin(deltaLongitude / 2) ** 2

  return 2 * EARTH_RADIUS_METRES * Math.asin(Math.min(Math.sqrt(haversine), 1))
}

export function geodesicPathLengthMetres(
  positions: readonly Position[],
): number | null {
  if (positions.length < 2) return null

  let total = 0
  for (let index = 0; index < positions.length - 1; index += 1) {
    const segment = geodesicDistanceMetres(
      positions[index],
      positions[index + 1],
    )
    if (segment === null) return null
    total += segment
  }

  return total > 0 ? total : null
}
