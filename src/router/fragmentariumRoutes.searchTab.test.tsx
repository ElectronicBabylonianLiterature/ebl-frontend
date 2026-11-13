import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryItem, QueryResult } from 'query/QueryResult'
import { FragmentQuery } from 'query/FragmentQuery'
import { renderLibrarySearch } from 'router/searchRoutes.testSupport'

jest.mock('router/head', () => ({
  __esModule: true,
  HeadTagsService: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

jest.mock(
  'fragmentarium/ui/search/FragmentariumSearchResultComponents',
  () => ({
    FragmentLines: ({ queryItem }: { queryItem: QueryItem }) => (
      <div>{queryItem.museumNumber}</div>
    ),
  }),
)

function buildQueryResult(query: FragmentQuery): QueryResult {
  return {
    items: [
      {
        museumNumber: `K.${(query.offset ?? 0) + 1}`,
        matchingLines: [],
        matchCount: 0,
      },
    ],
    matchCountTotal: null,
    totalDocuments: 237,
  }
}

describe('FragmentariumRoutes library search tabs', () => {
  it('selects the tab requested by the URL hash', async () => {
    renderLibrarySearch('/library/search/?number=K.1#corpus', buildQueryResult)

    expect(
      await screen.findByRole('tab', { name: 'Corpus', selected: true }),
    ).toBeVisible()
    expect(await screen.findByText('K.1')).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: 'Library', selected: false }),
    ).toBeVisible()
  })

  it('keeps the Library hash when paginating after switching from the Corpus tab', async () => {
    const view = renderLibrarySearch(
      '/library/search/?number=K.1#corpus',
      buildQueryResult,
    )

    expect(await screen.findByText('K.1')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('tab', { name: 'Library' }))
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/library/search/?number=K.1#library',
    )

    await userEvent.click(screen.getAllByText('2')[0])

    expect(await screen.findByText('K.51')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent(
        '/library/search/?number=K.1&paginationIndex=1#library',
      )
    })
    expect(
      screen.getByRole('tab', { name: 'Library', selected: true }),
    ).toBeVisible()
    expect(view.query).toHaveBeenLastCalledWith({
      number: 'K.1',
      limit: 51,
      offset: 50,
      count: 'exact',
    })
  })
})
