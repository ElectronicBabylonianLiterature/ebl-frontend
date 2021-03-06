import Museum from './museum'
import { factory } from 'factory-girl'
import bmLogo from './The_British_Museum.png'
import ybcLogo from './YBC_small.jpg'

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
    url: `https://www.britishmuseum.org/research/collection_online/collection_object_details.aspx?objectId=${encodeURIComponent(
      bmIdNumber
    )}&partId=1`,
    label: `The British Museum object ${bmIdNumber}`,
  }
  const britishMuseum = Museum.of(link.name)

  describe('hasFragmentLink', () => {
    test('fragment has bmIdNumber', async () => {
      const fragment = await factory.build('fragment', {
        bmIdNumber,
      })
      expect(britishMuseum.hasFragmentLink(fragment)).toEqual(true)
    })

    test('fragment does not have bmIdNumber', async () => {
      const fragment = await factory.build('fragment', {
        bmIdNumber: '',
      })
      expect(britishMuseum.hasFragmentLink(fragment)).toEqual(false)
    })
  })

  test('fragmentlink', async () => {
    const fragment = await factory.build('fragment', {
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
    test('fragment has accession', async () => {
      const fragment = await factory.build('fragment', {
        accession,
      })
      expect(ybc.hasFragmentLink(fragment)).toEqual(true)
    })

    test('fragment does not have accession', async () => {
      const fragment = await factory.build('fragment', {
        accession: '',
      })
      expect(ybc.hasFragmentLink(fragment)).toEqual(false)
    })
  })

  test('fragmentlink', async () => {
    const fragment = await factory.build('fragment', {
      accession,
    })
    expect(ybc.createLinkFor(fragment)).toEqual(link)
  })
})
