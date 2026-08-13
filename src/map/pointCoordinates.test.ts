import type { Feature, Geometry } from 'geojson'
import { getFeaturePointCoordinates } from 'map/pointCoordinates'

function feature(geometry: Geometry): Feature {
  return { type: 'Feature', properties: {}, geometry }
}

describe('getFeaturePointCoordinates', () => {
  it('returns longitude and latitude of a valid point', () => {
    expect(
      getFeaturePointCoordinates(
        feature({ type: 'Point', coordinates: [44.42, 32.542] }),
      ),
    ).toEqual([44.42, 32.542])
  })

  it.each([
    ['non-point geometry', { type: 'Polygon', coordinates: [] }],
    ['line geometry', { type: 'LineString', coordinates: [] }],
    ['non-finite longitude', { type: 'Point', coordinates: [NaN, 32.542] }],
    ['non-finite latitude', { type: 'Point', coordinates: [44.42, NaN] }],
    ['missing latitude', { type: 'Point', coordinates: [44.42] }],
    ['missing coordinates', { type: 'Point', coordinates: [] }],
  ])('rejects %s', (_label, geometry) => {
    expect(getFeaturePointCoordinates(feature(geometry as Geometry))).toBeNull()
  })
})
