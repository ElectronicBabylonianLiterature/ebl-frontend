// @flow
import Museum from './museum'

describe.each([
  [
    'The British Museum',
    'https://britishmuseum.org/',
    'Courtesy of the [Trustees of The British Museum](https://www.britishmuseum.org/about_this_site/terms_of_use/copyright_and_permissions.aspx)'
  ],
  [
    'National Museum of Iraq',
    '',
    'By Permission of the State Board of Antiquities and Heritage and The Iraq Museum'
  ],
  ['Other Museum', '', '']
])('%s', (name, url, copyright) => {
  let museum: Museum

  beforeEach(() => {
    museum = Museum.of(name)
  })

  test('name', () => {
    expect(museum.name).toEqual(name)
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
