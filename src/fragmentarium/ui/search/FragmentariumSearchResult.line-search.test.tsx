import { screen } from '@testing-library/react'
import {
  buildQueryResult,
  renderSearchResult,
} from 'fragmentarium/ui/search/FragmentariumSearchResult.testSupport'

describe('FragmentariumSearchResult line-search counts', () => {
  it('does not display zero when the total line count is unknown', async () => {
    renderSearchResult({
      queryResult: buildQueryResult({ matchCountTotal: null }),
      fragmentQuery: { transliteration: 'kur' },
    })

    await screen.findByText('K.1')
    expect(screen.queryByText(/0 lines/)).not.toBeInTheDocument()
  })

  it('separates exact line totals from page-size document ranges', async () => {
    const view = renderSearchResult({
      queryResult: {
        ...buildQueryResult({ matchCountTotal: 90, hasNextPage: true }),
        isMatchCountTotalExact: true,
      },
      fragmentQuery: { transliteration: 'kur' },
      pagination: { pageIndex: 0, pageSize: 50 },
    })

    expect(await screen.findByText('K.1')).toBeInTheDocument()
    expect(view.query).toHaveBeenCalledWith({
      transliteration: 'kur',
      limit: 51,
      offset: 0,
      count: 'exact',
    })
    expect(
      screen.getByText('Found 90 matching lines. Showing documents 1-50'),
    ).toBeInTheDocument()
    expect(screen.queryByText(/in 50 documents/)).not.toBeInTheDocument()
    expect(screen.queryByText('K.51')).not.toBeInTheDocument()
    expect(
      screen.queryByText(/more results are available/),
    ).not.toBeInTheDocument()
  })

  it('derives Next from overfetched line results when backend metadata is absent', async () => {
    renderSearchResult({
      queryResult: {
        ...buildQueryResult({ items: 51, matchCountTotal: 90 }),
        hasNextPage: null,
        isMatchCountTotalExact: true,
      },
      fragmentQuery: { transliteration: 'kur' },
      pagination: { pageIndex: 0, pageSize: 50 },
    })

    expect(await screen.findByText('K.1')).toBeInTheDocument()
    expect(screen.queryByText('K.51')).not.toBeInTheDocument()
    expect(screen.getAllByRole('listitem')[2]).not.toHaveClass('disabled')
  })

  it('prefers the overfetched item when backend pagination metadata is false', async () => {
    renderSearchResult({
      queryResult: {
        ...buildQueryResult({ items: 51, matchCountTotal: 90 }),
        hasNextPage: false,
        isMatchCountTotalExact: true,
      },
      fragmentQuery: { transliteration: 'kur' },
      pagination: { pageIndex: 0, pageSize: 50 },
    })

    expect(await screen.findByText('K.1')).toBeInTheDocument()
    expect(screen.queryByText('K.51')).not.toBeInTheDocument()
    expect(screen.getAllByRole('listitem')[2]).not.toHaveClass('disabled')
  })

  it('shows singular approximate line totals on later pages', async () => {
    const view = renderSearchResult({
      queryResult: {
        ...buildQueryResult({
          items: 1,
          matchCountTotal: 1,
          hasNextPage: false,
        }),
        isMatchCountTotalExact: false,
      },
      fragmentQuery: { lemmas: 'kur I' },
      pagination: { pageIndex: 2, pageSize: 25 },
    })

    expect(await screen.findByText('K.1')).toBeInTheDocument()
    expect(view.query).toHaveBeenCalledWith({
      lemmas: 'kur I',
      limit: 26,
      offset: 50,
      count: 'exact',
    })
    expect(
      screen.getByText('Found about 1 matching line. Showing documents 51-51'),
    ).toBeInTheDocument()
  })
})
