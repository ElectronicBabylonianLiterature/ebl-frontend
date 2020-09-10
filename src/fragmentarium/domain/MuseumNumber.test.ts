import MuseumNumber, { museumNumberToString } from './MuseumNumber'

test.each([
  [{ prefix: 'K', number: '1', suffix: '' }, 'K.1'],
  [{ prefix: 'K', number: '1', suffix: 'b' }, 'K.1.b'],
])('%s is parsed to %s', (number: MuseumNumber, expected: string) => {
  expect(museumNumberToString(number)).toEqual(expected)
})
