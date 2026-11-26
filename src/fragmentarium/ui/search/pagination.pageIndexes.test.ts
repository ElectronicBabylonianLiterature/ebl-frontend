import { getNumberedPageIndexes } from 'fragmentarium/ui/search/pagination'

describe('getNumberedPageIndexes', () => {
  it.each([
    [0, 0, [0]],
    [0, 1, [0, 1]],
    [0, 5, [0, 1, 2, 3, 4, 5]],
    [1, 5, [0, 1, 2, 3, 4, 5]],
    [4, 5, [0, 1, 2, 3, 4, 5]],
  ])(
    'shows the single page hidden by a one-page gap (active %i, last %i)',
    (activePage, lastPage, expected) => {
      expect(getNumberedPageIndexes(activePage, lastPage)).toEqual(expected)
    },
  )

  it.each([
    [0, 6, [0, 1, 2, 3, 'ellipsis', 6]],
    [6, 6, [0, 'ellipsis', 3, 4, 5, 6]],
    [3, 7, [0, 1, 2, 3, 4, 'ellipsis', 7]],
    [4, 8, [0, 'ellipsis', 3, 4, 5, 'ellipsis', 8]],
  ])(
    'keeps an ellipsis for gaps of two or more pages (active %i, last %i)',
    (activePage, lastPage, expected) => {
      expect(getNumberedPageIndexes(activePage, lastPage)).toEqual(expected)
    },
  )
})
