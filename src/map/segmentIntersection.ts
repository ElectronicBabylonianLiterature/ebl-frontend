import type { Position } from 'geojson'

function isFinitePosition(position: Position): boolean {
  return (
    Number.isFinite(position[0]) &&
    Number.isFinite(position[1]) &&
    Math.abs(position[1]) <= 90
  )
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

function isPositionOnSegment(
  position: Position,
  start: Position,
  end: Position,
): boolean {
  return (
    orientation(start, end, position) === 0 && isBetween(start, position, end)
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
    isPositionOnSegment(c, a, b) ||
    isPositionOnSegment(d, a, b) ||
    isPositionOnSegment(a, c, d) ||
    isPositionOnSegment(b, c, d)
  )
}
