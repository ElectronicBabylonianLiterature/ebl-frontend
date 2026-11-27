import {
  normalizeMesZlNumber,
  normalizeSignListNumber,
} from 'signs/domain/mesZlNumber'

test.each([
  ["527'", '527′'],
  ['527’', '527′'],
  ['527ʹ', '527′'],
  ["146''", '146′′'],
  [' 579 ', '579'],
  ['214′', '214′'],
])('normalizes the MesZL number %p', (number, expected) => {
  expect(normalizeMesZlNumber(number)).toEqual(expected)
})

test('only normalizes MesZL numbers', () => {
  expect(normalizeSignListNumber('MZL', "527'")).toEqual('527′')
  expect(normalizeSignListNumber('SLLHA', "527'")).toEqual("527'")
})
