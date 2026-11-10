import { isFiniteNumberInRange } from 'map/geodesy'

export function isCoordinateIntervalInRange(
  start: number,
  end: number,
  minimum: number,
  maximum: number,
): boolean {
  return (
    start < end &&
    [start, end].every((coordinate) =>
      isFiniteNumberInRange(coordinate, minimum, maximum),
    )
  )
}
