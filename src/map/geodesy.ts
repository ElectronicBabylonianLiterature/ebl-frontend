import type { Position } from 'geojson'

export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

export function isFiniteNumberInRange(
  value: unknown,
  minimum: number,
  maximum: number,
): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= minimum &&
    value <= maximum
  )
}

export function isValidLatitude(value: unknown): value is number {
  return isFiniteNumberInRange(value, -90, 90)
}

export function isFinitePosition(value: unknown): value is Position {
  if (!Array.isArray(value)) return false
  const [longitude, latitude] = value
  if (typeof longitude !== 'number' || !Number.isFinite(longitude)) return false
  return isValidLatitude(latitude)
}
