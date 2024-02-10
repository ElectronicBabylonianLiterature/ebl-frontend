import { Museums, MuseumKey } from './museum'
import {
  externalNumbersFactory,
  fragmentFactory,
} from 'test-support/fragment-fixtures'

describe.each([
  [
    'THE_BRITISH_MUSEUM',
    'The British Museum',
    'London',
    'GBR',
    'https://www.britishmuseum.org/',
    '© [The Trustees of the British Museum](https://www.britishmuseum.org/about_this_site/terms_of_use/copyright_and_permissions.aspx)',
  ],
  [
    'THE_IRAQ_MUSEUM',
    'The Iraq Museum',
    'Baghdad',
    'IRQ',
    '',
    'By Permission of the State Board of Antiquities and Heritage and The Iraq Museum',
  ],
  ['Other Museum', '', '', '', '', ''],
] as [MuseumKey, string, string, string, string, string][])(
  '%s',
  (
    key,
    expectedName,
    expectedcity,
    expectedcountry,
    expectedurl,
    expectedcopyright = ''
  ) => {
    const museum = Museums[key]

    test('name', () => {
      expect(museum.name).toEqual(expectedName)
    })

    test('city', () => {
      expect(museum.city).toEqual(expectedcity)
    })

    test('country', () => {
      expect(museum.country).toEqual(expectedcountry)
    })

    test('url', () => {
      expect(museum.url).toEqual(expectedurl)
    })

    test('copyright', () => {
      expect(museum?.copyright || '').toEqual(expectedcopyright)
    })
  }
)

describe('BritishMuseum', () => {
  const bmIdNumber = 'A 1234+43'
  const link = {
    name: 'The British Museum',
    url: `https://www.britishmuseum.org/collection/object/${encodeURIComponent(
      bmIdNumber
    )}`,
    label: `The British Museum object ${bmIdNumber}`,
  }
  const britishMuseum = Museums['THE_BRITISH_MUSEUM']

  describe('hasFragmentLink', () => {
    test('fragment has bmIdNumber', () => {
      const fragment = fragmentFactory.build(
        {},
        {
          associations: {
            externalNumbers: externalNumbersFactory.build({ bmIdNumber }),
          },
        }
      )
      expect(britishMuseum.hasFragmentLink(fragment)).toEqual(true)
    })

    test('fragment does not have bmIdNumber', () => {
      const fragment = fragmentFactory.build(
        {},
        {
          associations: {
            externalNumbers: externalNumbersFactory.build({ bmIdNumber: '' }),
          },
        }
      )
      expect(britishMuseum.hasFragmentLink(fragment)).toEqual(false)
    })
  })

  test('fragmentlink', () => {
    const fragment = fragmentFactory.build(
      {},
      {
        associations: {
          externalNumbers: externalNumbersFactory.build({ bmIdNumber }),
        },
      }
    )
    expect(britishMuseum.createLinkFor(fragment)).toEqual(link)
  })
})

describe('YaleBabylonianCollectionhMuseum', () => {
  const accession = 'A 1234+4.3'
  const expectedAccession = 'A 1234+4-3'
  const link = {
    name: 'Yale Babylonian Collection, Peabody Museum',
    url: `https://collections.peabody.yale.edu/search/Record/YPM-${encodeURIComponent(
      expectedAccession
    )}`,
    label: `Yale Babylonian Collection, Peabody Museum`,
  }
  const ybc = Museums['YALE_PEABODY_COLLECTION']

  describe('hasFragmentLink', () => {
    test('fragment has accession', () => {
      const fragment = fragmentFactory.build({
        accession,
      })
      expect(ybc.hasFragmentLink(fragment)).toEqual(true)
    })

    test('fragment does not have accession', () => {
      const fragment = fragmentFactory.build({
        accession: '',
      })
      expect(ybc.hasFragmentLink(fragment)).toEqual(false)
    })
  })

  test('fragmentlink', () => {
    const fragment = fragmentFactory.build({
      accession,
    })
    expect(ybc.createLinkFor(fragment)).toEqual(link)
  })
})
