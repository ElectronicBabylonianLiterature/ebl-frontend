import type { Feature, Point } from 'geojson'
import { isFiniteNumberInRange } from 'map/domain/geodesy'

const MAXIMUM_LONGITUDE = 180
const MAXIMUM_LATITUDE = 90

export function isValidPointCoordinate(
  longitude: unknown,
  latitude: unknown,
): boolean {
  return (
    isFiniteNumberInRange(longitude, -MAXIMUM_LONGITUDE, MAXIMUM_LONGITUDE) &&
    isFiniteNumberInRange(latitude, -MAXIMUM_LATITUDE, MAXIMUM_LATITUDE)
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
