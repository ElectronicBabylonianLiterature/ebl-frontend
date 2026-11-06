export function isCoordinateInRange(
  coordinate: number,
  minimum: number,
  maximum: number,
): boolean {
  return (
    Number.isFinite(coordinate) &&
    coordinate >= minimum &&
    coordinate <= maximum
  )
}

export function isCoordinateIntervalInRange(
  start: number,
  end: number,
  minimum: number,
  maximum: number,
): boolean {
  return (
    start < end &&
    [start, end].every((coordinate) =>
      isCoordinateInRange(coordinate, minimum, maximum),
    )
  )
}
