import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import { provenanceToGeoJson } from './provenanceToGeoJson'
import { provenancesToPolygonGeoJson } from './provenanceToPolygonGeoJson'

function makeProvenance(
  overrides: Partial<ProvenanceRecord> = {},
): ProvenanceRecord {
  return {
    id: 'babylon',
    longName: 'Babylon',
    abbreviation: 'Bab',
    sortKey: 1,
    coordinates: { latitude: 32.542, longitude: 44.42 },
    ...overrides,
  }
}

describe('provenancesToPolygonGeoJson', () => {
  it('creates a valid polygon from three vertices', () => {
    const result = provenancesToPolygonGeoJson([
      makeProvenance({
        polygonCoordinates: [
          { latitude: 32.1, longitude: 44.1 },
          { latitude: 32.2, longitude: 44.2 },
          { latitude: 32.3, longitude: 44.3 },
        ],
      }),
    ])

    expect(result.features).toHaveLength(1)
    expect(result.features[0].geometry).toEqual({
      type: 'Polygon',
      coordinates: [
        [
          [44.1, 32.1],
          [44.2, 32.2],
          [44.3, 32.3],
          [44.1, 32.1],
        ],
      ],
    })
  })

  it('uses longitude latitude ordering', () => {
    const result = provenancesToPolygonGeoJson([
      makeProvenance({
        polygonCoordinates: [
          { latitude: 10, longitude: 20 },
          { latitude: 11, longitude: 21 },
          { latitude: 12, longitude: 22 },
        ],
      }),
    ])

    expect(result.features[0].geometry.coordinates[0][0]).toEqual([20, 10])
  })

  it('closes an open ring', () => {
    const result = provenancesToPolygonGeoJson([
      makeProvenance({
        polygonCoordinates: [
          { latitude: 1, longitude: 2 },
          { latitude: 3, longitude: 4 },
          { latitude: 5, longitude: 6 },
        ],
      }),
    ])

    expect(result.features[0].geometry.coordinates[0]).toHaveLength(4)
    expect(result.features[0].geometry.coordinates[0][0]).toEqual(
      result.features[0].geometry.coordinates[0][3],
    )
  })

  it('does not close an already closed ring twice', () => {
    const result = provenancesToPolygonGeoJson([
      makeProvenance({
        polygonCoordinates: [
          { latitude: 1, longitude: 2 },
          { latitude: 3, longitude: 4 },
          { latitude: 5, longitude: 6 },
          { latitude: 1, longitude: 2 },
        ],
      }),
    ])

    expect(result.features[0].geometry.coordinates[0]).toHaveLength(4)
  })

  it('excludes polygons with fewer than three valid vertices after sanitization', () => {
    const result = provenancesToPolygonGeoJson([
      makeProvenance({
        coordinates: undefined,
        polygonCoordinates: [
          { latitude: 1, longitude: 2 },
          { latitude: Number.NaN, longitude: 4 },
          { latitude: 5, longitude: Number.POSITIVE_INFINITY },
        ],
      }),
    ])

    expect(result.features).toHaveLength(0)
  })

  it('preserves shared provenance ids across point and polygon collections', () => {
    const provenance = makeProvenance({
      id: 'uruk',
      longName: 'Uruk',
      polygonCoordinates: [
        { latitude: 32.1, longitude: 44.1 },
        { latitude: 32.2, longitude: 44.2 },
        { latitude: 32.3, longitude: 44.3 },
      ],
    })

    const pointResult = provenanceToGeoJson([provenance])
    const polygonResult = provenancesToPolygonGeoJson([provenance])

    expect(pointResult.features[0].id).toBe('uruk')
    expect(polygonResult.features[0].id).toBe('uruk')
    expect(pointResult.features[0].properties.geometryType).toBe('polygon')
    expect(polygonResult.features[0].properties.geometryType).toBe('polygon')
  })

  it('keeps polygon-backed provenances in the point collection as centroids', () => {
    const provenance = makeProvenance({
      id: 'uruk',
      longName: 'Uruk',
      polygonCoordinates: [
        { latitude: 32.1, longitude: 44.1 },
        { latitude: 32.2, longitude: 44.2 },
        { latitude: 32.3, longitude: 44.3 },
      ],
    })

    const pointResult = provenanceToGeoJson([provenance])

    expect(pointResult.features).toHaveLength(1)
    expect(pointResult.features[0].geometry.type).toBe('Point')
    expect(pointResult.features[0].properties.geometryType).toBe('polygon')
  })

  it('does not mutate input polygon coordinates', () => {
    const polygonCoordinates = [
      { latitude: 1, longitude: 2 },
      { latitude: 3, longitude: 4 },
      { latitude: 5, longitude: 6 },
    ]
    const provenance = makeProvenance({ polygonCoordinates })

    provenancesToPolygonGeoJson([provenance])

    expect(polygonCoordinates).toEqual([
      { latitude: 1, longitude: 2 },
      { latitude: 3, longitude: 4 },
      { latitude: 5, longitude: 6 },
    ])
  })

  it('keeps optional properties safe', () => {
    const result = provenancesToPolygonGeoJson([
      makeProvenance({
        parent: null,
        polygonCoordinates: [
          { latitude: 32.1, longitude: 44.1 },
          { latitude: 32.2, longitude: 44.2 },
          { latitude: 32.3, longitude: 44.3 },
        ],
      }),
    ])

    expect(result.features[0].properties).toEqual({
      id: 'babylon',
      name: 'Babylon',
      abbreviation: 'Bab',
      parent: undefined,
      geometryType: 'polygon',
    })
  })

  it('handles empty polygon coordinate lists safely', () => {
    const result = provenancesToPolygonGeoJson([
      makeProvenance({
        coordinates: undefined,
        polygonCoordinates: [],
      }),
    ])

    expect(result.features).toHaveLength(0)
  })

  it('preserves negative and zero coordinates', () => {
    const result = provenancesToPolygonGeoJson([
      makeProvenance({
        polygonCoordinates: [
          { latitude: 0, longitude: 0 },
          { latitude: -1.5, longitude: 2.5 },
          { latitude: 3.5, longitude: -4.5 },
        ],
      }),
    ])

    expect(result.features[0].geometry.coordinates[0]).toEqual([
      [0, 0],
      [2.5, -1.5],
      [-4.5, 3.5],
      [0, 0],
    ])
  })

  it('accepts readonly provenance input without mutation', () => {
    const polygonCoordinates = [
      { latitude: 1, longitude: 2 },
      { latitude: 3, longitude: 4 },
      { latitude: 5, longitude: 6 },
    ] as const
    const provenance = makeProvenance({ polygonCoordinates })
    const provenances = [provenance] as const

    const result = provenancesToPolygonGeoJson(provenances)

    expect(result.features).toHaveLength(1)
    expect(provenances[0].polygonCoordinates).toBe(polygonCoordinates)
  })
})
