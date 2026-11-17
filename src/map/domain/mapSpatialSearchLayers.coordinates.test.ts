import { spatialSearchCollection } from 'map/domain/mapSpatialSearchLayers'

it.each([
  [43, 91],
  [43, -91],
  [43, Number.NaN],
])(
  'omits a first corner with invalid latitude: %s, %s',
  (longitude, latitude) => {
    expect(spatialSearchCollection([longitude, latitude], []).features).toEqual(
      [],
    )
  },
)

it('preserves valid world-copy longitudes', () => {
  expect(spatialSearchCollection([403, 35], []).features[0].geometry).toEqual({
    type: 'Point',
    coordinates: [403, 35],
  })
})
