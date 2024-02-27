import { Museum, Museums } from './museum'

describe.each([
  [
    'THE_BRITISH_MUSEUM',
    {
      name: 'The British Museum',
      city: 'London',
      country: 'GBR',
      url: 'https://www.britishmuseum.org/',
      copyright:
        '© [The Trustees of the British Museum](https://www.britishmuseum.org/about_this_site/terms_of_use/copyright_and_permissions.aspx)',
    },
  ],
  [
    'THE_IRAQ_MUSEUM',
    {
      name: 'The Iraq Museum',
      city: 'Baghdad',
      country: 'IRQ',
      url: 'https://theiraqmuseum.com/',
      copyright:
        'By Permission of the State Board of Antiquities and Heritage and The Iraq Museum',
    },
  ],
  ['UNKNOWN', { name: '', city: '', country: '' }],
])('%s', (museumKey, expected: Museum) => {
  const museum: Museum = Museums[museumKey]
  test.each(['name', 'city', 'country', 'url', 'copyright'])(
    '%s has expected value',
    (param) => {
      expect(museum[param]).toEqual(expected[param])
    }
  )
})
