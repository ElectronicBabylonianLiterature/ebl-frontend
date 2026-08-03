import Chance from 'chance'
import {
  createFragmentCanonicalUrl,
  createFragmentUrl,
  createFragmentUrlWithFolio,
} from './FragmentLink'
import { parseUrl } from 'query-string'
import { folioFactory } from 'test-support/fragment-data-fixtures'
import { CANONICAL_ORIGIN } from 'router/domain'

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

it('preserves literal percent sequences in raw fragment numbers', () => {
  expect(createFragmentUrl('BM%20123')).toEqual('/library/BM%2520123')
  expect(createFragmentCanonicalUrl('BM%20123')).toEqual(
    `${CANONICAL_ORIGIN}/library/BM%2520123`,
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

it('Creates canonical fragment URL without query parameters', () => {
  const number = 'K 1+2/3'
  expect(createFragmentCanonicalUrl(number)).toEqual(
    `${CANONICAL_ORIGIN}/library/${encodeURIComponent(number)}`,
  )
})

it.each([
  'BM.123',
  'A B',
  'A/B',
  'A%41B',
  'A%20B',
  '100%',
  'Šumma ālu',
  '%',
  '%A',
  '%ZZ',
])(
  'encodes raw fragment number %s without semantic transformation',
  (number) => {
    const encodedNumber = encodeURIComponent(number)
    const canonicalUrl = createFragmentCanonicalUrl(number)

    expect(createFragmentUrl(number)).toEqual(`/library/${encodedNumber}`)
    expect(canonicalUrl).toEqual(`${CANONICAL_ORIGIN}/library/${encodedNumber}`)
    expect(canonicalUrl).not.toContain('?tab=')
  },
)

it('repairs malformed unicode before encoding', () => {
  expect(createFragmentUrl('A\uD800B')).toEqual('/library/A%EF%BF%BDB')
})
