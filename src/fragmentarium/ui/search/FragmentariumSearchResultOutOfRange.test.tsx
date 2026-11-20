import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import LocationDisplay from 'test-support/LocationDisplay'
import {
  buildQueryResult,
  renderSearchResult,
} from 'fragmentarium/ui/search/FragmentariumSearchResult.testSupport'

describe('FragmentariumSearchResult out-of-range pages', () => {
  it('renders neither results info nor pagination while redirecting an out-of-range page', async () => {
    const view = renderSearchResult({
      search: '?number=K.1&paginationIndex=99',
      queryResult: buildQueryResult({
        items: 0,
        hasNextPage: false,
        totalDocuments: 237,
      }),
      pagination: { pageIndex: 99, pageSize: 50 },
      leadingContent: <LocationDisplay />,
    })

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent(
        '/library/search/?number=K.1&paginationIndex=4',
      )
    })

    expect(view.query).toHaveBeenCalledTimes(1)
    expect(
      screen.queryByText('No results on this page'),
    ).not.toBeInTheDocument()
    expect(screen.queryByText(/Showing documents/)).not.toBeInTheDocument()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    expect(screen.queryByText('Next')).not.toBeInTheDocument()
    expect(screen.queryByText(/Loading/)).not.toBeInTheDocument()
    expect(view.container).toHaveTextContent(
      /^\/library\/search\/\?number=K\.1&paginationIndex=4$/,
    )
  })
})
