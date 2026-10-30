import React from 'react'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LocationDisplay from 'test-support/LocationDisplay'
import { SearchResultFragmentService } from 'fragmentarium/ui/search/FragmentariumSearchResult'
import { QueryResult } from 'query/QueryResult'
import {
  buildQueryResult,
  renderSearchResult,
} from 'fragmentarium/ui/search/FragmentariumSearchResult.testSupport'

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
      limit: 51,
      offset: 50,
      count: 'exact',
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
      expect(screen.queryAllByRole('navigation')).toHaveLength(0)
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
      expect(screen.getAllByRole('navigation')).toHaveLength(2)
    },
  )

  it('names the top and bottom pagers distinctly without duplicating ids', async () => {
    renderSearchResult({
      queryResult: buildQueryResult({
        items: 50,
        hasNextPage: true,
        totalDocuments: 237,
      }),
    })

    await screen.findByText('K.1')

    expect(
      screen
        .getAllByRole('navigation')
        .map((landmark) => landmark.getAttribute('aria-label')),
    ).toEqual([
      'Search results pagination, top',
      'Search results pagination, bottom',
    ])

    const controlIds = [
      ...screen.getAllByLabelText('Go to page'),
      ...screen.getAllByLabelText('Results per page'),
    ].map((control) => control.id)

    expect(controlIds).toHaveLength(4)
    expect(new Set(controlIds).size).toEqual(4)
  })

  it('points each pager label at the control in its own pager', async () => {
    renderSearchResult({
      queryResult: buildQueryResult({
        items: 50,
        hasNextPage: true,
        totalDocuments: 237,
      }),
    })

    await screen.findByText('K.1')

    const pagers = screen.getAllByRole('navigation')

    pagers.forEach((pager) => {
      const pageJump = within(pager).getByLabelText('Go to page')
      const pageSize = within(pager).getByLabelText('Results per page')

      expect(within(pager).getByText('Go to page')).toHaveAttribute(
        'for',
        pageJump.id,
      )
      expect(within(pager).getByText('Results per page')).toHaveAttribute(
        'for',
        pageSize.id,
      )
    })
  })

  it('shows controls on a later short page', async () => {
    renderSearchResult({
      queryResult: buildQueryResult({ items: 12, hasNextPage: false }),
      pagination: { pageIndex: 2, pageSize: 50 },
    })

    await screen.findByText('K.1')
    expect(screen.getAllByRole('navigation')).toHaveLength(2)
    expect(screen.getAllByRole('listitem')[0]).not.toHaveClass('disabled')
  })

  it('resolves first-page completeness from the overfetched item without hasNextPage', async () => {
    renderSearchResult({
      queryResult: buildQueryResult({ items: 51, hasNextPage: null }),
    })

    await screen.findByText('K.1')
    expect(screen.getAllByRole('navigation')).toHaveLength(2)
    expect(screen.getByText(/Showing documents 1-50/)).toBeInTheDocument()
    expect(screen.queryByText('K.51')).not.toBeInTheDocument()
  })

  it('reports a short first page as complete without hasNextPage', async () => {
    renderSearchResult({
      queryResult: buildQueryResult({ items: 12, hasNextPage: null }),
    })

    await screen.findByText('K.1')
    expect(screen.getByText('Found 12 documents')).toBeInTheDocument()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
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

  it('does not correct the next query using a stale earlier total', async () => {
    const fragmentService: jest.Mocked<SearchResultFragmentService> = {
      find: jest.fn(),
      findThumbnail: jest.fn(),
      query: jest
        .fn()
        .mockResolvedValueOnce({
          items: [{ museumNumber: 'K.old', matchingLines: [], matchCount: 0 }],
          matchCountTotal: null,
          totalDocuments: 1,
        })
        .mockResolvedValueOnce({
          items: [{ museumNumber: 'K.new', matchingLines: [], matchCount: 0 }],
          matchCountTotal: null,
          totalDocuments: 237,
        }),
    }
    const view = renderSearchResult({
      fragmentService,
      leadingContent: <LocationDisplay />,
    })
    expect(await screen.findByText('K.old')).toBeInTheDocument()

    view.renderView({
      fragmentQuery: { number: 'K.2' },
      pagination: { pageIndex: 4, pageSize: 50 },
    })

    expect(await screen.findByText('K.new')).toBeInTheDocument()
    expect(view.query).toHaveBeenCalledTimes(2)
    expect(screen.getByTestId('location')).not.toHaveTextContent(
      'paginationIndex=0',
    )
  })

  it('ignores stale responses when the effective page query changes', async () => {
    let resolveFirst: (value: QueryResult) => void = () => undefined
    let resolveSecond: (value: QueryResult) => void = () => undefined
    const fragmentService: jest.Mocked<SearchResultFragmentService> = {
      find: jest.fn(),
      findThumbnail: jest.fn(),
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
    }

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
