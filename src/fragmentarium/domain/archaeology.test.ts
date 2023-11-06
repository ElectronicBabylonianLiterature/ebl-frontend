import { archaeologyFactory } from 'test-support/fragment-fixtures'
import {
  createArchaeology,
  toArchaeologyDto,
  toFindspotDto,
} from './archaeology'
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
    findspot: archaeology.findspot ? toFindspotDto(archaeology.findspot) : null,
  })
})
test('createArchaeology', () => {
  expect(
    createArchaeology({
      ...toArchaeologyDto(archaeology),
      excavationNumber,
    })
  ).toEqual(archaeology)
})
