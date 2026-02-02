import Chance from 'chance'
import { createFragmentUrl, createFragmentUrlWithFolio } from './FragmentLink'
import { parseUrl } from 'query-string'
import { folioFactory } from 'test-support/fragment-data-fixtures'

const chance = new Chance()

it('Creates encoded URL', () => {
  const number = chance.string()
  expect(createFragmentUrl(number)).toEqual(
    `/library/${encodeURIComponent(number)}`,
  )
})

it('Creates URL with hash', () => {
  const number = chance.string()
  const hash = chance.string()
  expect(createFragmentUrl(number, hash)).toEqual(
    `/library/${encodeURIComponent(number)}#${encodeURIComponent(hash)}`,
  )
})

it('Creates URL with folio query', () => {
  const number = chance.string()
  const folio = folioFactory.build()
  expect(parseUrl(createFragmentUrlWithFolio(number, folio))).toEqual({
    url: `/library/${encodeURIComponent(number)}`,
    query: {
      tab: 'folio',
      folioName: folio.name,
      folioNumber: folio.number,
    },
  })
})
