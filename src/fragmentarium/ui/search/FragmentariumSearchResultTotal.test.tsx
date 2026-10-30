import { screen } from '@testing-library/react'
import {
  buildQueryResult,
  renderSearchResult,
} from 'fragmentarium/ui/search/FragmentariumSearchResult.testSupport'

describe('FragmentariumSearchResult known document totals', () => {
  it('shows bibliography document totals independently of matching lines', async () => {
    const view = renderSearchResult({
      fragmentQuery: { bibId: 'ABC' },
      queryResult: buildQueryResult({
        items: 50,
        totalDocuments: 237,
        matchCountTotal: 900,
        hasNextPage: null,
      }),
    })

    expect(await screen.findByText('K.1')).toBeInTheDocument()
    expect(screen.getByText('Showing documents 1-50 of 237')).toBeVisible()
    expect(screen.queryByText(/900 matching lines/)).not.toBeInTheDocument()
    expect(screen.getAllByText('5')).toHaveLength(2)
    expect(view.query).toHaveBeenCalledWith({
      bibId: 'ABC',
      limit: 51,
      offset: 0,
      count: 'exact',
    })
    expect(view.query).toHaveBeenCalledTimes(1)
  })

  it('shows the last document range and disables Next', async () => {
    renderSearchResult({
      queryResult: buildQueryResult({
        items: 37,
        totalDocuments: 237,
        hasNextPage: false,
      }),
      pagination: { pageIndex: 4, pageSize: 50 },
    })

    expect(await screen.findByText('K.1')).toBeInTheDocument()
    expect(screen.getByText('Showing documents 201-237 of 237')).toBeVisible()
    expect(screen.getAllByText('Next')[0]).not.toHaveAttribute('href')
  })

  it('hides pagination for an empty result with a known total', async () => {
    renderSearchResult({
      queryResult: buildQueryResult({
        items: 0,
        totalDocuments: 0,
        hasNextPage: false,
      }),
    })

    expect(await screen.findByText('Found 0 documents')).toBeVisible()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('keeps the page-size selector for a known single page of 30 results', async () => {
    renderSearchResult({
      queryResult: buildQueryResult({
        items: 30,
        totalDocuments: 30,
        hasNextPage: false,
      }),
    })

    expect(await screen.findByText('K.1')).toBeInTheDocument()
    expect(screen.getAllByLabelText('Results per page')).toHaveLength(2)
    expect(screen.getByText('Showing documents 1-30 of 30')).toBeVisible()
  })
})
