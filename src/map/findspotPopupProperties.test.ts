import type { MapGeoJSONFeature } from 'maplibre-gl'
import {
  getFeaturePointCoordinates,
  getPopupProperties,
} from 'map/findspotPopupProperties'

function feature(
  overrides: Partial<MapGeoJSONFeature> = {},
): MapGeoJSONFeature {
  return {
    type: 'Feature',
    properties: {
      name: 'Babylon',
      abbreviation: 'Bab',
      parent: 'Babylonia',
      geometryType: 'point',
    },
    geometry: { type: 'Point', coordinates: [44.42, 32.542] },
    ...overrides,
  } as MapGeoJSONFeature
}

describe('findspot popup properties', () => {
  it('gets valid point coordinates', () => {
    expect(getFeaturePointCoordinates(feature())).toEqual([44.42, 32.542])
  })

  it.each([
    ['non-point geometry', { type: 'LineString', coordinates: [] }],
    ['non-finite longitude', { type: 'Point', coordinates: [NaN, 32.542] }],
    ['non-finite latitude', { type: 'Point', coordinates: [44.42, NaN] }],
  ])('rejects %s', (_label, geometry) => {
    expect(
      getFeaturePointCoordinates(feature({ geometry } as never)),
    ).toBeNull()
  })

  it('builds popup properties from previously derived coordinates', () => {
    expect(getPopupProperties(feature(), [44.42, 32.542])).toEqual({
      name: 'Babylon',
      abbreviation: 'Bab',
      parent: 'Babylonia',
      geometryType: 'point',
      coordinates: { latitude: 32.542, longitude: 44.42 },
    })
  })

  it('allows missing parent values', () => {
    expect(
      getPopupProperties(
        feature({
          properties: {
            name: 'Uruk',
            abbreviation: 'Uru',
            geometryType: 'polygon',
          },
        }),
        [45.64, 31.32],
      ),
    ).toEqual({
      name: 'Uruk',
      abbreviation: 'Uru',
      parent: undefined,
      geometryType: 'polygon',
      coordinates: { latitude: 31.32, longitude: 45.64 },
    })
  })

  it.each([
    ['missing name', { abbreviation: 'Bab', geometryType: 'point' }],
    ['missing abbreviation', { name: 'Babylon', geometryType: 'point' }],
    [
      'invalid parent',
      {
        name: 'Babylon',
        abbreviation: 'Bab',
        parent: 42,
        geometryType: 'point',
      },
    ],
    [
      'invalid geometry type',
      { name: 'Babylon', abbreviation: 'Bab', geometryType: 'line' },
    ],
  ])('rejects %s', (_label, properties) => {
    expect(
      getPopupProperties(feature({ properties }), [44.42, 32.542]),
    ).toBeNull()
  })
})
