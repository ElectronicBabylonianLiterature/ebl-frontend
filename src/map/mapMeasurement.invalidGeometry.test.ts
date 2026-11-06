import { measure } from 'map/mapMeasurement'

it.each([
  [
    [
      [0, 0],
      [2, 2],
      [0, 2],
      [3, 0],
    ],
  ],
  [
    [
      [0, 0],
      [2, 0],
      [1, 0],
      [1, 1],
    ],
  ],
  [
    [
      [0, 0],
      [2, 0],
      [2, 0],
      [0, 2],
    ],
  ],
  [
    [
      [0, 0],
      [2, 0],
      [0, 0],
      [0, 2],
    ],
  ],
  [
    [
      [0, 0],
      [Infinity, 0],
      [1, 2],
    ],
  ],
  [
    [
      [0, 0],
      [1, 91],
      [1, 2],
    ],
  ],
])(
  'does not report a confident area for invalid user-drawn geometry %#',
  (positions) => {
    expect(measure('area', positions, 'metric').valueInBaseUnits).toBeNull()
  },
)

it('accepts a simple ring across the antimeridian after longitude unwrapping', () => {
  const area = measure(
    'area',
    [
      [179.9, 0],
      [-179.9, 0],
      [-179.9, 1],
      [179.9, 1],
    ],
    'metric',
  ).valueInBaseUnits
  expect(area).not.toBeNull()
  expect(area).toBeGreaterThan(0)
  expect(area).toBeLessThan(3_000_000_000)
})
