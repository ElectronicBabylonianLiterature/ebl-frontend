import {
  isCoordinateInRange,
  isCoordinateIntervalInRange,
} from 'map/spatialCoordinateValidation'

it.each<[number, boolean]>([
  [-90, true],
  [90, true],
  [0, true],
  [-90.001, false],
  [90.001, false],
  [Number.NaN, false],
  [Number.NEGATIVE_INFINITY, false],
  [Number.POSITIVE_INFINITY, false],
])(
  'validates latitude %s at inclusive geographic limits',
  (value, expected) => {
    expect(isCoordinateInRange(value, -90, 90)).toBe(expected)
  },
)

it.each([
  { start: -180, end: 180, expected: true },
  { start: 0, end: 1, expected: true },
  { start: -181, end: -180, expected: false },
  { start: 180, end: 181, expected: false },
  { start: 1, end: 1, expected: false },
  { start: 1, end: -1, expected: false },
  { start: Number.NaN, end: 1, expected: false },
  { start: -1, end: Number.NaN, expected: false },
  { start: Number.NEGATIVE_INFINITY, end: 1, expected: false },
  { start: -1, end: Number.POSITIVE_INFINITY, expected: false },
])('validates ordered longitude interval %j', ({ start, end, expected }) => {
  expect(isCoordinateIntervalInRange(start, end, -180, 180)).toBe(expected)
})
