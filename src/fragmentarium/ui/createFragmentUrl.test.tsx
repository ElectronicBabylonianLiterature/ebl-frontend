import Chance from 'chance'
import {
  createFragmentCanonicalUrl,
  createFragmentUrl,
  createFragmentUrlWithFolio,
} from './FragmentLink'
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

it('Normalizes already encoded fragment numbers', () => {
  expect(createFragmentUrl('BM%20123')).toEqual('/library/BM%20123')
  expect(createFragmentCanonicalUrl('BM%20123')).toEqual(
    'https://www.ebl.lmu.de/library/BM%20123',
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
    `https://www.ebl.lmu.de/library/${encodeURIComponent(number)}`,
  )
})

it.each(['BM.123', 'BM 123', 'K 1+2/3', 'BM%20123'])(
  'encodes %s exactly once in the canonical URL',
  (number) => {
    const canonicalUrl = createFragmentCanonicalUrl(number)

    expect(canonicalUrl).toContain(
      `https://www.ebl.lmu.de/library/${encodeURIComponent(
        decodeURIComponent(number),
      )}`,
    )
    expect(canonicalUrl).not.toContain('%2525')
    expect(canonicalUrl).not.toContain('?tab=')
  },
)
