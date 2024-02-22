import { Museum, Museums } from './museum'

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
    'https://theiraqmuseum.com/',
    'By Permission of the State Board of Antiquities and Heritage and The Iraq Museum',
  ],
  ['UNKNOWN', '', '', '', '', ''],
])(
  '%s',
  (
    key,
    expectedName,
    expectedcity,
    expectedcountry,
    expectedurl,
    expectedcopyright = ''
  ) => {
    const museum: Museum = Museums[key]
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
