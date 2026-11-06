import {
  getSumerianSearchUrl,
  getSumerianWordPageUrl,
  parseSumerianSearch,
} from 'sumerian-dictionary/ui/sumerianDictionaryPage'

it('builds the entry url', () => {
  expect(getSumerianWordPageUrl('sux-006390')).toEqual(
    '/tools/sumerian-dictionary/sux-006390',
  )
})

describe('parseSumerianSearch', () => {
  it('reads query, kind and source', () => {
    expect(parseSumerianSearch('?query=lugal&kind=names&source=epsd2')).toEqual(
      { query: 'lugal', kind: 'names', source: 'epsd2' },
    )
  })

  it('falls back to the defaults for missing or unknown values', () => {
    expect(
      parseSumerianSearch('?query=a&query=b&kind=verbs&source=borger'),
    ).toEqual({ query: '', kind: 'all', source: 'any' })
  })
})

describe('getSumerianSearchUrl', () => {
  it('leaves out defaults', () => {
    expect(
      getSumerianSearchUrl({ query: '', kind: 'all', source: 'any' }),
    ).toEqual('/tools/sumerian-dictionary')
  })

  it('writes every chosen value', () => {
    expect(
      getSumerianSearchUrl({
        query: 'dug₄',
        kind: 'words',
        source: 'attinger',
      }),
    ).toEqual(
      '/tools/sumerian-dictionary?kind=words&query=dug%E2%82%84&source=attinger',
    )
  })
})
