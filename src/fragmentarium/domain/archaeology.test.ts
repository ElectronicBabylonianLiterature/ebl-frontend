import { archaeologyFactory } from 'test-support/fragment-fixtures'
import { SiteKey, createArchaeology, toArchaeologyDto } from './archaeology'
import MuseumNumber, { museumNumberToString } from './MuseumNumber'

const excavationNumber: MuseumNumber = {
  prefix: 'A',
  number: '38',
  suffix: '',
}
const archaeology = archaeologyFactory.build({
  excavationNumber: museumNumberToString(excavationNumber),
})

test('toArchaeologyDto', () => {
  expect(toArchaeologyDto(archaeology)).toEqual({
    ...archaeology,
    site: archaeology.site?.name,
  })
})
test('createArchaeology', () => {
  expect(
    createArchaeology({
      ...archaeology,
      excavationNumber: excavationNumber,
      site: (archaeology.site?.name || '') as SiteKey,
    })
  ).toEqual(archaeology)
})
