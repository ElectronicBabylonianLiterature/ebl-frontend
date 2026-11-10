import { isFinitePosition, isValidLatitude, toRadians } from 'map/geodesy'

it.each([null, undefined, '0', NaN, Infinity, -91, 91])(
  'rejects an invalid latitude %p',
  (value) => {
    expect(isValidLatitude(value)).toBe(false)
  },
)

it.each([-90, 0, 90])('accepts a finite latitude %p', (value) => {
  expect(isValidLatitude(value)).toBe(true)
})

it.each([
  null,
  [],
  [0],
  ['0', 0],
  [NaN, 0],
  [Infinity, 0],
  [0, '0'],
  [0, NaN],
  [0, 91],
])('rejects a malformed position %p', (value) => {
  expect(isFinitePosition(value)).toBe(false)
})

it('keeps unwrapped world-copy longitudes valid and converts angles', () => {
  expect(isFinitePosition([540, -90])).toBe(true)
  expect(toRadians(180)).toBe(Math.PI)
})
