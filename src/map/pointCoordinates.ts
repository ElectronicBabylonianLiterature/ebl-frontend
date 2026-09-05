import type { Feature, Point } from 'geojson'

const MAXIMUM_LONGITUDE = 180
const MAXIMUM_LATITUDE = 90

function isWithinRange(value: unknown, limit: number): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    Math.abs(value) <= limit
  )
}

export function isValidPointCoordinate(
  longitude: unknown,
  latitude: unknown,
): boolean {
  return (
    isWithinRange(longitude, MAXIMUM_LONGITUDE) &&
    isWithinRange(latitude, MAXIMUM_LATITUDE)
  )
}

export function getFeaturePointCoordinates(
  feature: Feature,
): [number, number] | null {
  if (feature.geometry.type !== 'Point') return null

  const coordinates = (feature.geometry as Point).coordinates
  const longitude = coordinates[0]
  const latitude = coordinates[1]

  return isValidPointCoordinate(longitude, latitude)
    ? [longitude, latitude]
    : null
}
