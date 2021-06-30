import Chance from 'chance'
import { createFragmentUrl, createFragmentUrlWithFolio } from './FragmentLink'
import { parseUrl } from 'query-string'
import { folioFactory } from 'test-support/fragment-fixtures'

const chance = new Chance()

function doubleEncode(string) {
  // Double encoding is needed due to https://github.com/ReactTraining/history/issues/505
  return encodeURIComponent(encodeURIComponent(string))
}

it('Creates double encoded URL', () => {
  const number = chance.string()
  expect(createFragmentUrl(number)).toEqual(
    `/fragmentarium/${doubleEncode(number)}`
  )
})

it('Creates URL with folio query', () => {
  const number = chance.string()
  const folio = folioFactory.build()
  expect(parseUrl(createFragmentUrlWithFolio(number, folio))).toEqual({
    url: `/fragmentarium/${doubleEncode(number)}`,
    query: {
      tab: 'folio',
      folioName: folio.name,
      folioNumber: folio.number,
    },
  })
})
