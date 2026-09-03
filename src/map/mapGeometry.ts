import type { Feature, Geometry } from 'geojson'

export type BoundingBox = readonly [number, number, number, number]

export interface GeographicPoint {
  readonly latitude: number
  readonly longitude: number
}

export type Position = readonly [number, number]

export function centroidOf(
  coordinates: readonly GeographicPoint[],
): GeographicPoint | null {
  if (coordinates.length === 0) return null

  const sum = coordinates.reduce(
    (accumulated, coordinate) => ({
      latitude: accumulated.latitude + coordinate.latitude,
      longitude: accumulated.longitude + coordinate.longitude,
    }),
    { latitude: 0, longitude: 0 },
  )

  return {
    latitude: sum.latitude / coordinates.length,
    longitude: sum.longitude / coordinates.length,
  }
}

export function collectPositions(coordinates: unknown): Position[] {
  if (!Array.isArray(coordinates)) return []

  if (
    coordinates.length >= 2 &&
    typeof coordinates[0] === 'number' &&
    typeof coordinates[1] === 'number'
  ) {
    return [[coordinates[0], coordinates[1]]]
  }

  return coordinates.flatMap((entry) => collectPositions(entry))
}

export function boundingBoxOfPositions(
  positions: readonly Position[],
): BoundingBox | null {
  if (positions.length === 0) return null

  return positions.reduce<BoundingBox>(
    ([west, south, east, north], [longitude, latitude]) => [
      Math.min(west, longitude),
      Math.min(south, latitude),
      Math.max(east, longitude),
      Math.max(north, latitude),
    ],
    [
      positions[0][0],
      positions[0][1],
      positions[0][0],
      positions[0][1],
    ] as BoundingBox,
  )
}

export function boundingBoxOfGeometry(geometry: Geometry): BoundingBox | null {
  return geometry.type === 'GeometryCollection'
    ? unionBoundingBoxes(geometry.geometries.map(boundingBoxOfGeometry))
    : boundingBoxOfPositions(collectPositions(geometry.coordinates))
}

export function boundingBoxOfFeatures(
  features: readonly Feature[],
): BoundingBox | null {
  return unionBoundingBoxes(
    features.map((feature) => boundingBoxOfGeometry(feature.geometry)),
  )
}

export function unionBoundingBoxes(
  boxes: readonly (BoundingBox | null)[],
): BoundingBox | null {
  const present = boxes.filter((box): box is BoundingBox => box !== null)
  return present.length === 0
    ? null
    : present.reduce((left, right) => [
        Math.min(left[0], right[0]),
        Math.min(left[1], right[1]),
        Math.max(left[2], right[2]),
        Math.max(left[3], right[3]),
      ])
}

export function firstPosition(geometry: Geometry): Position | null {
  const [position] = collectPositions(
    geometry.type === 'GeometryCollection'
      ? geometry.geometries.map((entry) =>
          entry.type === 'GeometryCollection' ? [] : entry.coordinates,
        )
      : geometry.coordinates,
  )
  return position ?? null
}
