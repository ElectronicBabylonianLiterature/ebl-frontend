import {
  createPagedFragmentQuery,
  getLastPageIndex,
  parseSearchPagination,
  updatePageSizeSearchParam,
  updatePaginationSearchParam,
} from 'fragmentarium/ui/search/pagination'

it('preserves leading question marks and duplicate unrelated raw keys', () => {
  const search =
    '??paginationIndex=7&number=K.1&%3FpaginationIndex=8&note=a+b&note=%E0%A4%A&pagination%49ndex=2&paginationIndex=3'
  const updated = updatePaginationSearchParam(search, 'paginationIndex', 4)

  expect(updated).toBe(
    '?paginationIndex=7&number=K.1&%3FpaginationIndex=8&note=a+b&note=%E0%A4%A&paginationIndex=4',
  )
  expect(parseSearchPagination(`?${updated}`).pageIndex).toBe(4)
})

it('preserves question-prefixed page-size keys while updating real aliases', () => {
  expect(
    updatePageSizeSearchParam(
      '??limit=100&%3Flimit=25&l%69mit=100&pagination%49ndex=5',
      50,
    ),
  ).toBe('?limit=100&%3Flimit=25&limit=50&paginationIndex=0')
})

it.each([25, 50, 100])(
  'only numbers last pages navigable with page size %s',
  (pageSize) => {
    const lastNavigableIndex = Math.floor(
      (Number.MAX_SAFE_INTEGER - pageSize - 1) / pageSize,
    )
    const lastNavigableTotal = (lastNavigableIndex + 1) * pageSize
    const lastPage = getLastPageIndex(lastNavigableTotal, pageSize)
    const pagination = parseSearchPagination(
      `?limit=${pageSize}&paginationIndex=${lastPage}`,
    )

    expect(lastPage).toBe(lastNavigableIndex)
    expect(pagination.pageIndex).toBe(lastNavigableIndex)
    const query = createPagedFragmentQuery({ number: 'K.1' }, pagination)
    expect(
      Number.isSafeInteger(Number(query.offset) + Number(query.limit)),
    ).toBe(true)
    expect(getLastPageIndex(lastNavigableTotal + 1, pageSize)).toBeNull()
    expect(getLastPageIndex(Number.MAX_SAFE_INTEGER, pageSize)).toBeNull()
    expect(
      parseSearchPagination(
        `?limit=${pageSize}&paginationIndex=${lastNavigableIndex + 1}`,
      ).pageIndex,
    ).toBe(0)
  },
)
