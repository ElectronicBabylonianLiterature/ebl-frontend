import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render } from '@testing-library/react'
import PaginationItems from 'fragmentarium/ui/search/PaginationItems'

export const mockHistoryPush = jest.fn()

jest.mock('router/compat', () => ({
  ...jest.requireActual('router/compat'),
  useHistory: () => ({
    push: mockHistoryPush,
    replace: jest.fn(),
    location: { pathname: '/library/search/', search: '' },
  }),
}))

export function renderPaginationItems(
  activePage = 0,
  hasNextPage = true,
  initialEntry = '/library/search/',
  pageSize = 50,
  lastPageIndex: number | null = null,
) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <PaginationItems
        paginationURLParam="paginationIndex"
        activePage={activePage}
        pageSize={pageSize}
        hasNextPage={hasNextPage}
        lastPageIndex={lastPageIndex}
        position="top"
      />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  mockHistoryPush.mockClear()
})
