import {
  getRenderableProvenanceGeometry,
  sanitizeProvenanceRecord,
  ProvenanceRecord,
} from './Provenance'

describe('sanitizeProvenanceRecord', () => {
  it('keeps valid point and polygon geometry', () => {
    const record: ProvenanceRecord = {
      id: 'babylon',
      longName: 'Babylon',
      abbreviation: 'Bab',
      parent: 'Babylonia',
      sortKey: 1,
      coordinates: {
        latitude: 32.542,
        longitude: 44.42,
        uncertaintyRadiusKm: 3,
        notes: 'approximate',
      },
      polygonCoordinates: [
        { latitude: 32.5, longitude: 44.3 },
        { latitude: 32.6, longitude: 44.4 },
        { latitude: 32.55, longitude: 44.5 },
      ],
    }

    expect(sanitizeProvenanceRecord(record)).toEqual(record)
  })

  it('drops malformed point geometry', () => {
    const record: ProvenanceRecord = {
      id: 'sippar',
      longName: 'Sippar',
      abbreviation: 'Sip',
      sortKey: 1,
      coordinates: {
        latitude: Number.NaN,
        longitude: 44.2,
      },
    }

    expect(sanitizeProvenanceRecord(record).coordinates).toBeUndefined()
  })

  it('drops malformed polygon geometry with fewer than 3 valid points', () => {
    const record: ProvenanceRecord = {
      id: 'assur',
      longName: 'Aššur',
      abbreviation: 'Ašš',
      sortKey: 1,
      polygonCoordinates: [
        { latitude: 36.34, longitude: 43.11 },
        { latitude: Number.NaN, longitude: 43.12 },
        { latitude: 36.35, longitude: Number.POSITIVE_INFINITY },
      ],
    }

    expect(sanitizeProvenanceRecord(record).polygonCoordinates).toBeUndefined()
  })
})

describe('getRenderableProvenanceGeometry', () => {
  it('prefers polygon when present', () => {
    const record: ProvenanceRecord = {
      id: 'uruk',
      longName: 'Uruk',
      abbreviation: 'Urk',
      sortKey: 1,
      coordinates: {
        latitude: 31.32,
        longitude: 45.64,
      },
      polygonCoordinates: [
        { latitude: 31.3, longitude: 45.6 },
        { latitude: 31.35, longitude: 45.62 },
        { latitude: 31.33, longitude: 45.67 },
      ],
    }

    expect(getRenderableProvenanceGeometry(record)).toEqual({
      type: 'polygon',
      coordinates: record.polygonCoordinates,
    })
  })

  it('falls back to point when polygon is malformed', () => {
    const record: ProvenanceRecord = {
      id: 'nippur',
      longName: 'Nippur',
      abbreviation: 'Nip',
      sortKey: 1,
      coordinates: {
        latitude: 32.12,
        longitude: 45.12,
      },
      polygonCoordinates: [
        { latitude: 32.1, longitude: 45.1 },
        { latitude: Number.NaN, longitude: 45.2 },
      ],
    }

    expect(getRenderableProvenanceGeometry(record)).toEqual({
      type: 'point',
      coordinates: record.coordinates,
    })
  })

  it('returns undefined when no valid geometry exists', () => {
    const record: ProvenanceRecord = {
      id: 'unknown',
      longName: 'Unknown',
      abbreviation: 'Unk',
      sortKey: 1,
      coordinates: {
        latitude: Number.NaN,
        longitude: Number.NaN,
      },
    }

    expect(getRenderableProvenanceGeometry(record)).toBeUndefined()
  })
})
