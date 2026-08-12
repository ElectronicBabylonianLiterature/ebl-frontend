import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useLocation } from 'react-router-dom'
import FragmentService from 'fragmentarium/application/FragmentService'
import { QueryResult } from 'query/QueryResult'
import {
  buildQueryResult,
  renderSearchResult,
} from './FragmentariumSearchResult.testSupport'

function LocationDisplay(): JSX.Element {
  const location = useLocation()
  return <div data-testid="location">{location.search}</div>
}

describe('FragmentariumSearchResult pagination', () => {
  it('renders the current server page and request range without chunking', async () => {
    const view = renderSearchResult({
      pagination: { pageIndex: 1, pageSize: 50 },
    })

    expect(await screen.findByText('K.1')).toBeInTheDocument()
    expect(screen.getByText(/Showing documents 51-100/)).toBeInTheDocument()
    expect(screen.getAllByText('Page 2')[0]).toBeInTheDocument()
    expect(view.query).toHaveBeenCalledWith({
      number: 'K.1',
      limit: 50,
      offset: 50,
      count: 'page',
    })
  })

  it('enables Next only when hasNextPage is true and updates the URL', async () => {
    renderSearchResult({
      search: '?number=000123&paginationIndex=0',
      queryResult: buildQueryResult({ hasNextPage: true }),
      leadingContent: <LocationDisplay />,
    })

    await screen.findByText('K.1')
    await userEvent.click(screen.getAllByText('Next')[0])

    expect(screen.getByTestId('location')).toHaveTextContent(
      'number=000123&paginationIndex=1',
    )
  })

  it.each([0, 1, 12, 24])(
    'hides controls for a known-complete first page with %i results',
    async (items) => {
      renderSearchResult({
        queryResult: buildQueryResult({ items, hasNextPage: false }),
      })

      await screen.findByText(new RegExp(`Found ${items} document`))
      expect(
        screen.queryByRole('group', { name: 'Pagination controls' }),
      ).not.toBeInTheDocument()
    },
  )

  it.each([25, 26, 50, 51])(
    'shows controls on the first page with %i results',
    async (items) => {
      renderSearchResult({
        queryResult: buildQueryResult({
          items,
          hasNextPage: items > 50,
        }),
      })

      await screen.findByText('K.1')
      expect(
        screen.getAllByRole('group', { name: 'Pagination controls' }),
      ).toHaveLength(2)
    },
  )

  it('shows controls on a later short page', async () => {
    renderSearchResult({
      queryResult: buildQueryResult({ items: 12, hasNextPage: false }),
      pagination: { pageIndex: 2, pageSize: 50 },
    })

    await screen.findByText('K.1')
    expect(
      screen.getAllByRole('group', { name: 'Pagination controls' }),
    ).toHaveLength(2)
    expect(screen.getAllByRole('listitem')[0]).not.toHaveClass('disabled')
  })

  it('shows controls when first-page completeness is unknown', async () => {
    renderSearchResult({
      queryResult: buildQueryResult({ items: 12, hasNextPage: null }),
    })

    await screen.findByText('K.1')
    expect(
      screen.getAllByRole('group', { name: 'Pagination controls' }),
    ).toHaveLength(2)
  })

  it('keeps a usable Previous control for an empty directly linked page', async () => {
    renderSearchResult({
      queryResult: buildQueryResult({ items: 0, hasNextPage: false }),
      pagination: { pageIndex: 2, pageSize: 50 },
    })

    expect(await screen.findByText('No results on this page')).toBeVisible()
    expect(screen.getAllByRole('listitem')[0]).not.toHaveClass('disabled')
  })

  it('shows a number-format suggestion when no Library results match', async () => {
    renderSearchResult({
      queryResult: buildQueryResult({ items: 0, hasNextPage: false }),
      fragmentQuery: { number: 'K 2' },
    })

    expect(await screen.findByText(/Found 0 documents/)).toBeVisible()
    expect(screen.getByRole('link', { name: 'K.2' })).toHaveAttribute(
      'href',
      '/library/search?number=K.2',
    )
  })

  it('ignores stale responses when the effective page query changes', async () => {
    let resolveFirst: (value: QueryResult) => void = () => undefined
    let resolveSecond: (value: QueryResult) => void = () => undefined
    const fragmentService = {
      query: jest
        .fn()
        .mockReturnValueOnce(
          new Promise<QueryResult>((resolve) => {
            resolveFirst = resolve
          }),
        )
        .mockReturnValueOnce(
          new Promise<QueryResult>((resolve) => {
            resolveSecond = resolve
          }),
        ),
    } as unknown as jest.Mocked<FragmentService>

    const view = renderSearchResult({
      search: '?number=K.1',
      fragmentService,
    })

    view.renderView({
      pagination: { pageIndex: 1, pageSize: 50 },
    })

    resolveSecond({
      items: [{ museumNumber: 'K.new', matchingLines: [], matchCount: 0 }],
      matchCountTotal: null,
      hasNextPage: false,
    })
    expect(await screen.findByText('K.new')).toBeInTheDocument()

    resolveFirst({
      items: [{ museumNumber: 'K.old', matchingLines: [], matchCount: 0 }],
      matchCountTotal: null,
      hasNextPage: false,
    })

    await waitFor(() => {
      expect(screen.queryByText('K.old')).not.toBeInTheDocument()
    })
  })
})
