import getLibraryCountUnit from 'fragmentarium/ui/search/getLibraryCountUnit'

describe('getLibraryCountUnit', () => {
  it.each([
    [{ transliteration: 'ku\nmu' }, 'matching passage'],
    [{ transliteration: 'ku\nmu', lemmas: 'a+b' }, 'matching line'],
    [
      { lemmas: 'a+b', lemmaOperator: 'phrase' as const },
      'matching occurrence',
    ],
    [
      {
        lemmas: 'a+b',
        lemmaOperator: 'phrase' as const,
        transliteration: 'ku',
      },
      'matching line',
    ],
    [{ lemmas: 'a', lemmaOperator: 'phrase' as const }, 'matching line'],
    [{ lemmas: 'a+b', lemmaOperator: 'and' as const }, 'matching line'],
    [{ transliteration: 'ku' }, 'matching line'],
    [{}, 'matching line'],
  ])('counts %p in %s units', (fragmentQuery, expectedUnit) => {
    expect(getLibraryCountUnit(fragmentQuery)).toBe(expectedUnit)
  })
})
