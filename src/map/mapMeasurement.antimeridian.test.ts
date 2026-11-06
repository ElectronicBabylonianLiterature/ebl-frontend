import { GeoJSONVT } from '@maplibre/geojson-vt'
import type { Position } from 'geojson'
import { measure, type MeasurementMode } from 'map/mapMeasurement'
import { measurementCollection } from 'map/mapMeasurementLayers'

it.each<MeasurementMode>(['distance', 'area'])(
  'renders a dateline %s measurement along the measured short edges',
  (mode) => {
    const positions: Position[] =
      mode === 'distance'
        ? [
            [179, 0],
            [-179, 0],
          ]
        : [
            [179, -1],
            [-179, -1],
            [-179, 1],
            [179, 1],
          ]
    const collection = measurementCollection(mode, positions)
    const tiles = new GeoJSONVT(collection)

    expect(tiles.getTile(4, 8, 7)?.features ?? []).toEqual([])
    expect(tiles.getTile(4, 8, 8)?.features ?? []).toEqual([])
    expect(tiles.getTile(4, 15, 8)?.features.length).toBeGreaterThan(0)
    expect(tiles.getTile(4, 0, 8)?.features.length).toBeGreaterThan(0)
    expect(measure(mode, positions, 'metric').valueInBaseUnits).toBeGreaterThan(
      0,
    )
  },
)

it('keeps consecutive points in the same repeated world', () => {
  const collection = measurementCollection('distance', [
    [539, 0],
    [-179, 0],
  ])
  expect(collection.features[2].geometry).toEqual({
    type: 'LineString',
    coordinates: [
      [539, 0],
      [541, 0],
    ],
  })
  expect(
    measure(
      'distance',
      [
        [539, 0],
        [-179, 0],
      ],
      'metric',
    ).label,
  ).toBe('222.39 km')
})

it('closes dateline areas in the same world without mutating the input', () => {
  const positions = [
    [179, -1],
    [-179, -1],
    [-179, 1],
    [179, 1],
  ]
  const collection = measurementCollection('area', positions)
  expect(collection.features[4].geometry).toEqual({
    type: 'LineString',
    coordinates: [
      [179, -1],
      [181, -1],
      [181, 1],
      [179, 1],
      [179, -1],
    ],
  })
  expect(positions[1]).toEqual([-179, -1])
})
