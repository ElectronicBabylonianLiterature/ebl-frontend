import {
  parseSearchPagination,
  updatePageSizeSearchParam,
  updatePaginationSearchParam,
} from 'fragmentarium/ui/search/pagination'

describe('pagination URL updates', () => {
  it('replaces decoded pagination aliases and duplicates with one canonical key', () => {
    const search =
      '?number=K.%31&genre=CANONICAL%3ATechnical&note=a+b&pagination%49ndex=99&paginationIndex=3&%70aginationIndex=2&broken=%E0%A4%A'

    const updated = updatePaginationSearchParam(search, 'paginationIndex', 4)

    expect(updated).toBe(
      'number=K.%31&genre=CANONICAL%3ATechnical&note=a+b&paginationIndex=4&broken=%E0%A4%A',
    )
    expect(parseSearchPagination(`?${updated}`).pageIndex).toBe(4)
  })

  it('updates encoded page-size and page-index keys together', () => {
    const updated = updatePageSizeSearchParam(
      '?number=K.%31&l%69mit=25&limit=100&pagination%49ndex=5',
      50,
    )

    expect(updated).toBe('number=K.%31&limit=50&paginationIndex=0')
    expect(parseSearchPagination(`?${updated}`)).toEqual({
      pageIndex: 0,
      pageSize: 50,
    })
  })

  it('replaces encoded aliases for a separate Corpus page parameter', () => {
    const updated = updatePaginationSearchParam(
      '?corpusPagination%49ndex=99&number=K.%31&corpusPaginationIndex=2',
      'corpusPaginationIndex',
      4,
    )

    expect(updated).toBe('corpusPaginationIndex=4&number=K.%31')
  })

  it('preserves unrelated plus and malformed key bytes', () => {
    const updated = updatePaginationSearchParam(
      '?pagination+Index=9&pagination%Index=8&number=K.%31',
      'paginationIndex',
      4,
    )

    expect(updated).toBe(
      'pagination+Index=9&pagination%Index=8&number=K.%31&paginationIndex=4',
    )
    expect(parseSearchPagination(`?${updated}`).pageIndex).toBe(4)
  })
})
