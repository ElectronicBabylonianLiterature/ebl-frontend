import {
  createPagedFragmentQuery,
  getRequestedPaginationIndex,
  getValidatedPageSize,
  isLineQuery,
  parseSearchCriteria,
  parseSearchPagination,
  RESULTS_PER_PAGE,
} from './pagination'

describe('parseSearchPagination', () => {
  it('defaults to the first page and the default page size', () => {
    expect(parseSearchPagination('?number=K.1')).toEqual({
      pageIndex: 0,
      pageSize: RESULTS_PER_PAGE,
    })
  })

  it('reads the requested page index and page size from the URL', () => {
    expect(parseSearchPagination('?limit=25&paginationIndex=3')).toEqual({
      pageIndex: 3,
      pageSize: 25,
    })
  })

  it.each(['abc', '-5', '1.5', ''])(
    'treats paginationIndex=%s as the first page',
    (paginationIndex) => {
      expect(
        parseSearchPagination(`?paginationIndex=${paginationIndex}`).pageIndex,
      ).toEqual(0)
    },
  )

  it.each(['abc', '51', '0'])(
    'falls back to the default page size for limit=%s',
    (limit) => {
      expect(parseSearchPagination(`?limit=${limit}`).pageSize).toEqual(
        RESULTS_PER_PAGE,
      )
    },
  )
})

describe('getRequestedPaginationIndex safe-integer boundary', () => {
  it('accepts Number.MAX_SAFE_INTEGER', () => {
    expect(
      getRequestedPaginationIndex('?paginationIndex=9007199254740991'),
    ).toEqual(Number.MAX_SAFE_INTEGER)
  })

  it('rejects the first unsafe integer (2^53)', () => {
    expect(
      getRequestedPaginationIndex('?paginationIndex=9007199254740992'),
    ).toBeUndefined()
  })

  it('rejects values far beyond the safe-integer range', () => {
    expect(
      getRequestedPaginationIndex('?paginationIndex=999999999999999999999'),
    ).toBeUndefined()
  })

  it('still rejects negative, fractional and non-numeric values', () => {
    expect(getRequestedPaginationIndex('?paginationIndex=-1')).toBeUndefined()
    expect(getRequestedPaginationIndex('?paginationIndex=1.5')).toBeUndefined()
    expect(getRequestedPaginationIndex('?paginationIndex=abc')).toBeUndefined()
  })

  it('still accepts an ordinary safe page index', () => {
    expect(getRequestedPaginationIndex('?paginationIndex=2')).toEqual(2)
  })
})

describe('getValidatedPageSize', () => {
  it.each([25, 50, 100])('accepts the supported page size %s', (pageSize) => {
    expect(getValidatedPageSize(pageSize)).toEqual(pageSize)
  })

  it.each([undefined, null, 51, 'not-a-number'])(
    'falls back to the default page size for %s',
    (value) => {
      expect(getValidatedPageSize(value)).toEqual(RESULTS_PER_PAGE)
    },
  )
})

describe('parseSearchCriteria', () => {
  it('keeps arbitrary search criteria and decodes them', () => {
    expect(
      parseSearchCriteria(
        '?project=CAIC&genre=CANONICAL%3ATechnical&number=000123',
      ),
    ).toEqual({
      project: 'CAIC',
      genre: 'CANONICAL:Technical',
      number: '000123',
    })
  })

  it('drops pagination parameters so they cannot reach the API untranslated', () => {
    expect(
      parseSearchCriteria(
        '?project=CAIC&paginationIndex=3&limit=25&offset=99&count=none',
      ),
    ).toEqual({ project: 'CAIC' })
  })
})

describe('isLineQuery', () => {
  it.each([
    [{ transliteration: 'kur' }, true],
    [{ lemmas: 'kur I' }, true],
    [{ project: 'CAIC' as const }, false],
    [{ number: 'K.1' }, false],
  ])('classifies %o as line query %s', (fragmentQuery, expected) => {
    expect(isLineQuery(fragmentQuery)).toEqual(expected)
  })
})

describe('createPagedFragmentQuery', () => {
  it('bounds a document query to one page and asks for page metadata', () => {
    expect(
      createPagedFragmentQuery(
        { project: 'CAIC' },
        { pageIndex: 0, pageSize: 50 },
      ),
    ).toEqual({ project: 'CAIC', limit: 50, offset: 0, count: 'page' })
  })

  it('offsets later pages by the visible page size', () => {
    expect(
      createPagedFragmentQuery(
        { project: 'CAIC' },
        { pageIndex: 2, pageSize: 25 },
      ),
    ).toEqual({ project: 'CAIC', limit: 25, offset: 50, count: 'page' })
  })

  it('overfetches line queries by one item to detect the next page', () => {
    expect(
      createPagedFragmentQuery(
        { transliteration: 'kur' },
        { pageIndex: 1, pageSize: 50 },
      ),
    ).toEqual({
      transliteration: 'kur',
      limit: 51,
      offset: 50,
      count: 'exact',
    })
  })

  it('preserves every other search criterion', () => {
    expect(
      createPagedFragmentQuery(
        { project: 'CAIC', genre: 'CANONICAL', museum: 'THE_BRITISH_MUSEUM' },
        { pageIndex: 0, pageSize: 100 },
      ),
    ).toEqual({
      project: 'CAIC',
      genre: 'CANONICAL',
      museum: 'THE_BRITISH_MUSEUM',
      limit: 100,
      offset: 0,
      count: 'page',
    })
  })
})
