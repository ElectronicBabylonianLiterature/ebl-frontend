import Museum, { FragmentLink } from './museum'
import { factory } from 'factory-girl'
import bmLogo from './The_British_Museum.png'

const bmIdNumber = 'A 1234+43'
describe.each([
  [
    'The British Museum',
    bmLogo,
    'https://britishmuseum.org/',
    'Courtesy of the [Trustees of The British Museum](https://www.britishmuseum.org/about_this_site/terms_of_use/copyright_and_permissions.aspx)',
    {
      name: 'The British Museum',
      logo: bmLogo,
      url: `https://www.britishmuseum.org/research/collection_online/collection_object_details.aspx?objectId=${encodeURIComponent(
        bmIdNumber
      )}&partId=1`,
      label: `The British Museum object ${bmIdNumber}`,
    },
  ],
  [
    'National Museum of Iraq',
    '',
    '',
    'By Permission of the State Board of Antiquities and Heritage and The Iraq Museum',
    null,
  ],
  ['Other Museum', '', '', '', null],
] as [string, string, string, string, FragmentLink | null][])(
  '%s',
  (name, logo, url, copyright, link) => {
    let museum: Museum

    beforeEach(() => {
      museum = Museum.of(name)
    })

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

    test('hasFragmentLink bmIdNumber', async () => {
      const fragment = await factory.build('fragment', { bmIdNumber })
      expect(museum.hasFragmentLink(fragment)).toEqual(link !== null)
    })

    test('hasFragmentLink no bmIdNumber', async () => {
      const fragment = await factory.build('fragment', { bmIdNumber: '' })
      expect(museum.hasFragmentLink(fragment)).toEqual(false)
    })

    if (link !== null) {
      test('fragmentlink', async () => {
        const fragment = await factory.build('fragment', { bmIdNumber })
        expect(museum.createLinkFor(fragment)).toEqual(link)
      })
    }
  }
)
