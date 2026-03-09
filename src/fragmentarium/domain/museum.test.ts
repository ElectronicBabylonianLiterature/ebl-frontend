import { Museum, Museums } from './museum'

describe.each([
  [
    'THE_BRITISH_MUSEUM',
    {
      key: Museums.THE_BRITISH_MUSEUM.key,
      name: 'The British Museum',
      city: 'London',
      country: 'GB',
      url: 'https://www.britishmuseum.org/',
      copyright:
        '© [The Trustees of the British Museum](https://www.britishmuseum.org/about_this_site/terms_of_use/copyright_and_permissions.aspx), [CC-BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)',
    },
  ],
  [
    'THE_IRAQ_MUSEUM',
    {
      key: Museums.THE_IRAQ_MUSEUM.key,
      name: 'The Iraq Museum',
      city: 'Baghdad',
      country: 'IQ',
      url: 'https://theiraqmuseum.com/',
      copyright:
        'By Permission of the State Board of Antiquities and Heritage and The Iraq Museum',
    },
  ],
  ['UNKNOWN', { key: Museums.UNKNOWN.key, name: '', city: '', country: '' }],
])('%s', (museumKey, expected: Museum) => {
  const museum: Museum = Museums[museumKey]
  test.each(['name', 'city', 'country', 'url', 'copyright'])(
    '%s has expected value',
    (param) => {
      expect(museum[param]).toEqual(expected[param])
    },
  )
})
