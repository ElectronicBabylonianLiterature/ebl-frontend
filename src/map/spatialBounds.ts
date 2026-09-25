import type { MultiPolygon, Polygon, Position } from 'geojson'
import type { BoundingBox } from 'map/mapGeometry'

const WEST = -180
const EAST = 180

export function wrapLongitude(longitude: number): number {
  if (!Number.isFinite(longitude)) return Number.NaN
  return ((((longitude - WEST) % 360) + 360) % 360) + WEST
}

function hasValidLatitudes(south: number, north: number): boolean {
  return (
    Number.isFinite(south) &&
    Number.isFinite(north) &&
    south >= -90 &&
    north <= 90 &&
    south < north
  )
}

function canonicalInterval(
  west: number,
  east: number,
  south: number,
  north: number,
): readonly BoundingBox[] | null {
  const width = east - west
  if (
    !Number.isFinite(west) ||
    !Number.isFinite(east) ||
    !hasValidLatitudes(south, north) ||
    width <= 0
  ) {
    return null
  }
  if (width >= 360) return [[WEST, south, EAST, north]]

  const canonicalWest = wrapLongitude(west)
  const canonicalEast = canonicalWest + width
  if (canonicalEast <= EAST) {
    return [[canonicalWest, south, canonicalEast, north]]
  }
  return [
    [canonicalWest, south, EAST, north],
    [WEST, south, canonicalEast - 360, north],
  ]
}

export function viewportSearchBounds(
  west: number,
  south: number,
  east: number,
  north: number,
): readonly BoundingBox[] | null {
  if (![west, south, east, north].every(Number.isFinite)) return null

  let orderedEast = east
  if (orderedEast < west) {
    orderedEast += (Math.floor((west - orderedEast) / 360) + 1) * 360
  }
  return canonicalInterval(west, orderedEast, south, north)
}

export function drawnRectangleBounds(
  first: Position,
  second: Position,
): readonly BoundingBox[] | null {
  const [firstLongitude, firstLatitude] = first
  const [secondLongitude, secondLatitude] = second
  if (
    ![firstLongitude, firstLatitude, secondLongitude, secondLatitude].every(
      Number.isFinite,
    )
  ) {
    return null
  }

  const rawDelta = secondLongitude - firstLongitude
  const delta = ((((rawDelta + 180) % 360) + 360) % 360) - 180
  const south = Math.min(firstLatitude, secondLatitude)
  const north = Math.max(firstLatitude, secondLatitude)
  const otherLongitude = firstLongitude + delta

  return canonicalInterval(
    Math.min(firstLongitude, otherLongitude),
    Math.max(firstLongitude, otherLongitude),
    south,
    north,
  )
}

function coordinatesOf([west, south, east, north]: BoundingBox): Position[] {
  return [
    [west, south],
    [east, south],
    [east, north],
    [west, north],
    [west, south],
  ]
}

export function geometryOfBounds(
  bounds: readonly BoundingBox[],
): Polygon | MultiPolygon | null {
  if (bounds.length === 1) {
    return { type: 'Polygon', coordinates: [coordinatesOf(bounds[0])] }
  }
  if (bounds.length === 2) {
    return {
      type: 'MultiPolygon',
      coordinates: bounds.map((box) => [coordinatesOf(box)]),
    }
  }
  return null
}
