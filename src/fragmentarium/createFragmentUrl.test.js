import Chance from 'chance'
import { createFragmentUrl, createFragmentUrlWithFolio } from './FragmentLink'
import queryString from 'query-string'

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
  const folioName = chance.string()
  const folioNumber = chance.string()
  expect(
    queryString.parseUrl(
      createFragmentUrlWithFolio(number, folioName, folioNumber)
    )
  ).toEqual({
    url: `/fragmentarium/${doubleEncode(number)}`,
    query: {
      folioName: folioName,
      folioNumber: folioNumber
    }
  })
})
