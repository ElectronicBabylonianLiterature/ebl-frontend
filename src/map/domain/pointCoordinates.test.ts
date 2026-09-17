import type { Feature, Geometry } from 'geojson'
import { getFeaturePointCoordinates } from 'map/domain/pointCoordinates'

function feature(geometry: Geometry): Feature {
  return { type: 'Feature', properties: {}, geometry }
}

function point(coordinates: number[]): Feature {
  return feature({ type: 'Point', coordinates })
}

describe('getFeaturePointCoordinates', () => {
  it('returns longitude and latitude of a valid point', () => {
    expect(getFeaturePointCoordinates(point([44.42, 32.542]))).toEqual([
      44.42, 32.542,
    ])
  })

  it.each([
    ['minimum longitude', [-180, 0]],
    ['maximum longitude', [180, 0]],
    ['minimum latitude', [0, -90]],
    ['maximum latitude', [0, 90]],
  ])('accepts the %s boundary', (_label, coordinates) => {
    expect(getFeaturePointCoordinates(point(coordinates))).toEqual(coordinates)
  })

  it.each([
    ['non-point geometry', { type: 'Polygon', coordinates: [] }],
    ['line geometry', { type: 'LineString', coordinates: [] }],
  ])('rejects %s', (_label, geometry) => {
    expect(getFeaturePointCoordinates(feature(geometry as Geometry))).toBeNull()
  })

  it.each([
    ['non-finite longitude', [NaN, 32.542]],
    ['non-finite latitude', [44.42, NaN]],
    ['infinite longitude', [Infinity, 32.542]],
    ['negatively infinite latitude', [44.42, -Infinity]],
    ['missing latitude', [44.42]],
    ['missing coordinates', []],
    ['longitude below the western limit', [-180.0001, 32.542]],
    ['longitude above the eastern limit', [180.0001, 32.542]],
    ['latitude below the southern limit', [44.42, -90.0001]],
    ['latitude above the northern limit', [44.42, 90.0001]],
    ['transposed coordinates outside the latitude range', [32.542, 444.2]],
    ['a finite but astronomical latitude', [44.42, 1e308]],
  ])('rejects %s', (_label, coordinates) => {
    expect(getFeaturePointCoordinates(point(coordinates))).toBeNull()
  })
})
