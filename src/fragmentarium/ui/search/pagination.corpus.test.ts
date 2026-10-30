import {
  corpusPageSizeURLParam,
  corpusPaginationURLParam,
  parseSearchPagination,
  updatePageSizeSearchParam,
} from 'fragmentarium/ui/search/pagination'

describe('Corpus pagination parameters', () => {
  it('reads Corpus pagination independently from Library pagination', () => {
    expect(
      parseSearchPagination(
        '?limit=100&paginationIndex=2&corpusLimit=25&corpusPaginationIndex=3',
        corpusPaginationURLParam,
        corpusPageSizeURLParam,
      ),
    ).toEqual({ pageIndex: 3, pageSize: 25 })
  })

  it('changes Corpus page size without resetting the Library page', () => {
    expect(
      updatePageSizeSearchParam(
        'paginationIndex=2&limit=100&corpusPaginationIndex=3&corpusLimit=25',
        50,
        corpusPaginationURLParam,
        corpusPageSizeURLParam,
      ),
    ).toEqual(
      'paginationIndex=2&limit=100&corpusPaginationIndex=0&corpusLimit=50',
    )
  })
})
