import Museum from './museum'
import bmLogo from './The_British_Museum.png'
import ybcLogo from './YBC_small.jpg'
import { fragmentFactory } from 'test-support/fragment-fixtures'

describe.each([
  [
    'The British Museum',
    bmLogo,
    'https://britishmuseum.org/',
    'Courtesy of the [Trustees of The British Museum](https://www.britishmuseum.org/about_this_site/terms_of_use/copyright_and_permissions.aspx)',
  ],
  [
    'National Museum of Iraq',
    '',
    '',
    'By Permission of the State Board of Antiquities and Heritage and The Iraq Museum',
    null,
    null,
  ],
  [
    'Yale Babylonian Collection, Peabody Museum',
    ybcLogo,
    'https://babylonian-collection.yale.edu/',
    'Courtesy of the [Yale Babylonian Collection](https://peabody.yale.edu/about-us/terms-use-what-you-need-know)',
  ],
  ['Other Museum', '', '', '', null, null],
] as [string, string, string, string][])('%s', (name, logo, url, copyright) => {
  const museum: Museum = Museum.of(name)

  test('name', () => {
    expect(museum.name).toEqual(name)
  })

  test('logo', () => {
    expect(museum.logo).toEqual(logo)
  })

  test('hasUrl', () => {
    expect(museum.hasUrl).toEqual(url !== '')
  })

  test('url', () => {
    expect(museum.url).toEqual(url)
  })

  test('hasCopyright', () => {
    expect(museum.hasCopyright).toEqual(copyright !== '')
  })

  test('copyright', () => {
    expect(museum.copyright).toEqual(copyright)
  })
})

describe('BritishMuseum', () => {
  const bmIdNumber = 'A 1234+43'
  const link = {
    name: 'The British Museum',
    logo: bmLogo,
    url: `https://www.britishmuseum.org/collection/object/${encodeURIComponent(
      bmIdNumber
    )}`,
    label: `The British Museum object ${bmIdNumber}`,
  }
  const britishMuseum = Museum.of(link.name)

  describe('hasFragmentLink', () => {
    test('fragment has bmIdNumber', () => {
      const fragment = fragmentFactory.build({
        bmIdNumber,
      })
      expect(britishMuseum.hasFragmentLink(fragment)).toEqual(true)
    })

    test('fragment does not have bmIdNumber', () => {
      const fragment = fragmentFactory.build({
        bmIdNumber: '',
      })
      expect(britishMuseum.hasFragmentLink(fragment)).toEqual(false)
    })
  })

  test('fragmentlink', () => {
    const fragment = fragmentFactory.build({
      bmIdNumber,
    })
    expect(britishMuseum.createLinkFor(fragment)).toEqual(link)
  })
})

describe('YaleBabylonianCollectionhMuseum', () => {
  const accession = 'A 1234+4.3'
  const expectedAccession = 'A 1234+4-3'
  const link = {
    name: 'Yale Babylonian Collection, Peabody Museum',
    logo: ybcLogo,
    url: `https://collections.peabody.yale.edu/search/Record/YPM-${encodeURIComponent(
      expectedAccession
    )}`,
    label: `Yale Babylonian Collection, Peabody Museum`,
  }
  const ybc = Museum.of(link.name)

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
