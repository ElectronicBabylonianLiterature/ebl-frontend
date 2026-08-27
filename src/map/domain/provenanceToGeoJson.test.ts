import type { Point } from 'geojson'
import { provenanceToGeoJson } from 'map/domain/provenanceToGeoJson'
import { makeProvenance } from 'map/testFixtures/provenance'

describe('provenanceToGeoJson', () => {
  it('converts a valid point provenance to a GeoJSON feature', () => {
    const result = provenanceToGeoJson([makeProvenance()])

    expect(result.type).toBe('FeatureCollection')
    expect(result.features).toHaveLength(1)
    const feature = result.features[0]
    expect(feature.type).toBe('Feature')
    expect(feature.id).toBe('babylon')
    expect(feature.geometry).toEqual({
      type: 'Point',
      coordinates: [44.42, 32.542],
    })
    expect(feature.properties).toEqual({
      id: 'babylon',
      name: 'Babylon',
      abbreviation: 'Bab',
      parent: undefined,
      geometryType: 'point',
    })
  })

  it('converts a polygon provenance to a point using centroid', () => {
    const record = makeProvenance({
      parent: 'Babylonia',
      polygonCoordinates: [
        { latitude: 36.3, longitude: 43.1 },
        { latitude: 36.4, longitude: 43.2 },
        { latitude: 36.35, longitude: 43.15 },
        { latitude: 36.35, longitude: 43.15 },
      ],
    })
    const result = provenanceToGeoJson([record])

    expect(result.features).toHaveLength(1)
    const coords = (result.features[0].geometry as Point).coordinates
    expect(coords[0]).toBeCloseTo(43.15, 5)
    expect(coords[1]).toBeCloseTo(36.35, 5)
    expect(result.features[0].properties.abbreviation).toBe('Bab')
    expect(result.features[0].properties.parent).toBe('Babylonia')
    expect(result.features[0].properties.geometryType).toBe('polygon')
  })

  it('skips provenances with missing coordinates', () => {
    const result = provenanceToGeoJson([
      makeProvenance({ coordinates: undefined, polygonCoordinates: undefined }),
    ])

    expect(result.features).toHaveLength(0)
  })

  it('skips provenances with malformed coordinates', () => {
    const result = provenanceToGeoJson([
      makeProvenance({
        coordinates: { latitude: Number.NaN, longitude: 44.42 },
      }),
    ])

    expect(result.features).toHaveLength(0)
  })

  it('handles an empty array', () => {
    const result = provenanceToGeoJson([])
    expect(result.type).toBe('FeatureCollection')
    expect(result.features).toHaveLength(0)
  })

  it('handles a mix of valid and invalid provenances', () => {
    const valid = makeProvenance({
      id: 'uruk',
      longName: 'Uruk',
      coordinates: { latitude: 31.32, longitude: 45.64 },
    })
    const missing = makeProvenance({
      id: 'unknown',
      longName: 'Unknown',
      coordinates: undefined,
      polygonCoordinates: undefined,
    })
    const malformed = makeProvenance({
      id: 'bad',
      longName: 'Bad',
      coordinates: { latitude: Number.NaN, longitude: 0 },
    })

    const result = provenanceToGeoJson([valid, missing, malformed])

    expect(result.features).toHaveLength(1)
    expect(result.features[0].properties.name).toBe('Uruk')
  })

  it('returns an empty FeatureCollection when all provenances are invalid', () => {
    const result = provenanceToGeoJson([
      makeProvenance({ coordinates: undefined }),
      makeProvenance({ coordinates: { latitude: Number.NaN, longitude: 0 } }),
    ])

    expect(result.features).toHaveLength(0)
  })

  it.each([
    ['an out-of-range latitude', { latitude: 925.4, longitude: 44.42 }],
    ['an out-of-range longitude', { latitude: 32.542, longitude: -180.5 }],
  ])('skips provenances with %s', (_label, coordinates) => {
    expect(
      provenanceToGeoJson([makeProvenance({ coordinates })]).features,
    ).toHaveLength(0)
  })

  it('skips polygons whose approximate point falls outside the valid range', () => {
    const result = provenanceToGeoJson([
      makeProvenance({
        coordinates: undefined,
        polygonCoordinates: [
          { latitude: 120, longitude: 43.1 },
          { latitude: 130, longitude: 43.2 },
          { latitude: 140, longitude: 43.15 },
        ],
      }),
    ])

    expect(result.features).toHaveLength(0)
  })
})
