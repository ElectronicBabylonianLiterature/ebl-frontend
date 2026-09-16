import type { Position } from 'geojson'
import {
  MAX_ELEVATION_SAMPLES,
  MIN_ELEVATION_SAMPLES,
  type ElevationSample,
  buildElevationProfile,
  elevationSampleCount,
  formatElevation,
  sampleAlongPath,
  toSourceElevation,
} from './mapElevationProfile'

const line: readonly Position[] = [
  [43.25, 35.45],
  [43.28, 35.45],
]

function samplesWith(
  elevations: readonly (number | null)[],
): readonly ElevationSample[] {
  return elevations.map((elevationMetres, index) => ({
    position: [43.25 + index * 0.001, 35.45] as Position,
    distanceMetres: index * 100,
    elevationMetres,
  }))
}

describe('elevationSampleCount', () => {
  it('uses fewer samples for a short line', () => {
    expect(elevationSampleCount(120)).toBe(MIN_ELEVATION_SAMPLES)
  })

  it('caps a very long line', () => {
    expect(elevationSampleCount(10 ** 6)).toBe(MAX_ELEVATION_SAMPLES)
  })

  it('scales in between and survives an unusable length', () => {
    expect(elevationSampleCount(1000)).toBe(40)
    expect(elevationSampleCount(Number.NaN)).toBe(MIN_ELEVATION_SAMPLES)
    expect(elevationSampleCount(0)).toBe(MIN_ELEVATION_SAMPLES)
  })
})

describe('sampleAlongPath', () => {
  it('spaces samples evenly by distance along the line', () => {
    const samples = sampleAlongPath(line, 5)

    expect(samples).toHaveLength(5)
    expect(samples[0].distanceMetres).toBe(0)
    expect(samples[4].distanceMetres).toBeGreaterThan(0)
    expect(samples[2].distanceMetres).toBeCloseTo(
      samples[4].distanceMetres / 2,
      3,
    )
  })

  it('walks across multiple segments', () => {
    const samples = sampleAlongPath(
      [
        [43.25, 35.45],
        [43.26, 35.45],
        [43.3, 35.45],
      ],
      9,
    )

    expect(samples[8].position[0]).toBeCloseTo(43.3, 4)
  })

  it('returns nothing for an unmeasurable line', () => {
    expect(sampleAlongPath([[43.25, 35.45]], 8)).toEqual([])
    expect(sampleAlongPath(line, 1)).toEqual([])
    expect(
      sampleAlongPath(
        [
          [43.25, 35.45],
          [43.25, 35.45],
        ],
        8,
      ),
    ).toEqual([])
  })
})

describe('buildElevationProfile', () => {
  const profile = buildElevationProfile(samplesWith([100, 130, 110, 160]))!

  it('reports the range and the endpoints', () => {
    expect(profile.minElevationMetres).toBe(100)
    expect(profile.maxElevationMetres).toBe(160)
    expect(profile.startElevationMetres).toBe(100)
    expect(profile.endElevationMetres).toBe(160)
    expect(profile.distanceMetres).toBe(300)
  })

  it('accumulates ascent and descent separately', () => {
    expect(profile.totalAscentMetres).toBe(80)
    expect(profile.totalDescentMetres).toBe(20)
  })

  it('ignores samples the terrain model could not resolve', () => {
    expect(
      buildElevationProfile(samplesWith([100, null, 120]))?.maxElevationMetres,
    ).toBe(120)
  })

  it('is null rather than partial when nothing resolved', () => {
    expect(buildElevationProfile(samplesWith([null, null]))).toBeNull()
    expect(buildElevationProfile([])).toBeNull()
  })
})

describe('toSourceElevation', () => {
  it('removes the active exaggeration so a metre stays a metre', () => {
    expect(toSourceElevation(280, 2)).toBe(140)
    expect(toSourceElevation(140, 1)).toBe(140)
  })

  it('reports the same source elevation at any exaggeration', () => {
    expect(toSourceElevation(140 * 1.4, 1.4)).toBeCloseTo(
      toSourceElevation(140 * 2, 2)!,
      6,
    )
  })

  it('refuses to invent a value', () => {
    expect(toSourceElevation(undefined, 1)).toBeNull()
    expect(toSourceElevation(null, 1)).toBeNull()
    expect(toSourceElevation(Number.NaN, 1)).toBeNull()
    expect(toSourceElevation(100, 0)).toBeNull()
  })
})

describe('formatElevation', () => {
  it('rounds to whole metres', () => {
    expect(formatElevation(140.4)).toBe('140 m')
    expect(formatElevation(1234.6)).toBe('1,235 m')
  })
})
