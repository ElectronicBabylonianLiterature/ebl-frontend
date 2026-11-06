import { isSimpleMeasurementRing } from 'map/measurementRing'

it.each([
  { ring: [] },
  { ring: [[0, 0]] },
  {
    ring: [
      [0, 0],
      [1, 0],
      [0, 0],
    ],
  },
  {
    ring: [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ],
  },
])('refuses incomplete or unclosed measurement boundaries %#', ({ ring }) => {
  expect(isSimpleMeasurementRing(ring)).toBe(false)
})

it('accepts a closed simple measurement boundary', () => {
  expect(
    isSimpleMeasurementRing([
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 0],
    ]),
  ).toBe(true)
})
