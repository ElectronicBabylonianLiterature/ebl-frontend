import type { Position } from 'geojson'
import { geodesicDistanceMetres } from './geodesicDistance'

export const MAX_ELEVATION_SAMPLES = 128
export const MIN_ELEVATION_SAMPLES = 16
/** One sample per ~25 m keeps short lines cheap and long lines bounded. */
export const METRES_PER_SAMPLE = 25

export const ELEVATION_PROFILE_TITLE = 'Modern elevation profile'
export const ELEVATION_PROFILE_NOTE =
  'Elevation values come from the active modern terrain model and do not reconstruct ancient topography.'

export interface ElevationSample {
  readonly position: Position
  readonly distanceMetres: number
  readonly elevationMetres: number | null
}

export interface ElevationProfile {
  readonly samples: readonly ElevationSample[]
  readonly distanceMetres: number
  readonly minElevationMetres: number
  readonly maxElevationMetres: number
  readonly startElevationMetres: number
  readonly endElevationMetres: number
  readonly totalAscentMetres: number
  readonly totalDescentMetres: number
}

export function elevationSampleCount(lengthMetres: number): number {
  if (!Number.isFinite(lengthMetres) || lengthMetres <= 0) {
    return MIN_ELEVATION_SAMPLES
  }

  return Math.min(
    MAX_ELEVATION_SAMPLES,
    Math.max(
      MIN_ELEVATION_SAMPLES,
      Math.ceil(lengthMetres / METRES_PER_SAMPLE),
    ),
  )
}

function cumulativeDistances(
  positions: readonly Position[],
): readonly number[] {
  const distances = [0]

  for (let index = 0; index < positions.length - 1; index += 1) {
    const segment =
      geodesicDistanceMetres(positions[index], positions[index + 1]) ?? 0
    distances.push(distances[index] + segment)
  }

  return distances
}

function interpolatePosition(
  from: Position,
  to: Position,
  ratio: number,
): Position {
  return [
    from[0] + (to[0] - from[0]) * ratio,
    from[1] + (to[1] - from[1]) * ratio,
  ]
}

/**
 * Evenly spaced by *distance along the line*, not by vertex, so a long segment
 * is not under-sampled next to a short one. The count is capped before any
 * terrain lookup happens.
 */
export function sampleAlongPath(
  positions: readonly Position[],
  count: number,
): readonly { position: Position; distanceMetres: number }[] {
  if (positions.length < 2 || count < 2) return []

  const distances = cumulativeDistances(positions)
  const total = distances[distances.length - 1]
  if (total <= 0) return []

  let segment = 0

  return Array.from({ length: count }, (_entry, index) => {
    const target = (total * index) / (count - 1)

    while (segment < distances.length - 2 && distances[segment + 1] < target) {
      segment += 1
    }

    const spanStart = distances[segment]
    const spanLength = distances[segment + 1] - spanStart
    const ratio = spanLength === 0 ? 0 : (target - spanStart) / spanLength

    return {
      position: interpolatePosition(
        positions[segment],
        positions[segment + 1],
        ratio,
      ),
      distanceMetres: target,
    }
  })
}

function ascentAndDescent(elevations: readonly number[]): {
  ascent: number
  descent: number
} {
  let ascent = 0
  let descent = 0

  for (let index = 1; index < elevations.length; index += 1) {
    const delta = elevations[index] - elevations[index - 1]
    if (delta > 0) ascent += delta
    else descent -= delta
  }

  return { ascent, descent }
}

/**
 * Returns null rather than a partial profile when no sample resolved: an
 * elevation figure the terrain model could not supply must not be shown.
 */
export function buildElevationProfile(
  samples: readonly ElevationSample[],
): ElevationProfile | null {
  const elevations = samples.flatMap((sample) =>
    sample.elevationMetres === null ? [] : [sample.elevationMetres],
  )
  if (elevations.length < 2) return null

  const { ascent, descent } = ascentAndDescent(elevations)

  return {
    samples,
    distanceMetres: samples[samples.length - 1].distanceMetres,
    minElevationMetres: Math.min(...elevations),
    maxElevationMetres: Math.max(...elevations),
    startElevationMetres: elevations[0],
    endElevationMetres: elevations[elevations.length - 1],
    totalAscentMetres: ascent,
    totalDescentMetres: descent,
  }
}

/**
 * MapLibre reports terrain elevation with the active exaggeration already
 * applied. Dividing it out is what keeps a reported metre a real metre, so a
 * reader cannot inflate the landscape and then quote the inflated figure.
 */
export function toSourceElevation(
  exaggeratedElevation: number | null | undefined,
  exaggeration: number,
): number | null {
  if (typeof exaggeratedElevation !== 'number') return null
  if (!Number.isFinite(exaggeratedElevation)) return null

  return exaggeration > 0 ? exaggeratedElevation / exaggeration : null
}

export function formatElevation(metres: number): string {
  return `${Math.round(metres).toLocaleString('en')} m`
}
