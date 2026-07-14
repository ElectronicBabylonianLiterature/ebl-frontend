import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { SearchResult } from './FragmentariumSearchResult'
import FragmentService from 'fragmentarium/application/FragmentService'
import DossiersService from 'dossiers/application/DossiersService'
import { QueryItem, QueryResult } from 'query/QueryResult'
import { FragmentQuery } from 'query/FragmentQuery'

jest.mock(
  'fragmentarium/ui/search/FragmentariumSearchResultComponents',
  () => ({
    FragmentLines: ({ queryItem }: { queryItem: QueryItem }) => (
      <div>{queryItem.museumNumber}</div>
    ),
  }),
)

function LocationDisplay(): JSX.Element {
  const location = useLocation()
  return <div data-testid="location">{location.search}</div>
}

function buildQueryResult({
  items = 50,
  hasNextPage = true,
  matchCountTotal = null,
}: {
  items?: number
  hasNextPage?: boolean | null
  matchCountTotal?: number | null
} = {}): QueryResult {
  return {
    items: Array.from({ length: items }, (_, index) => ({
      museumNumber: `K.${index + 1}`,
      matchingLines: [],
      matchCount: 0,
    })),
    matchCountTotal,
    hasNextPage,
  }
}

function renderSearchResult({
  search = '',
  queryResult = buildQueryResult(),
  fragmentQuery = {
    number: 'K.1',
    limit: 50,
    offset: 0,
    count: 'page' as const,
  },
}: {
  search?: string
  queryResult?: QueryResult
  fragmentQuery?: FragmentQuery
} = {}): jest.Mocked<FragmentService> {
  const fragmentService = {
    query: jest.fn().mockResolvedValue(queryResult),
  } as unknown as jest.Mocked<FragmentService>

  render(
    <MemoryRouter initialEntries={[`/library/search/${search}`]}>
      <LocationDisplay />
      <SearchResult
        fragmentService={fragmentService}
        dossiersService={{} as DossiersService}
        fragmentQuery={fragmentQuery}
      />
    </MemoryRouter>,
  )

  return fragmentService
}

describe('FragmentariumSearchResult pagination', () => {
  it('renders the current server page and request range without chunking', async () => {
    const view = renderSearchResult({
      fragmentQuery: { number: 'K.1', limit: 50, offset: 50, count: 'page' },
    })

    expect(await screen.findByText('K.1')).toBeInTheDocument()
    expect(screen.getByText(/Showing results 51-100/)).toBeInTheDocument()
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
    })

    await screen.findByText('K.1')
    await userEvent.click(screen.getAllByText('Next')[0])

    expect(screen.getByTestId('location')).toHaveTextContent(
      'number=000123&paginationIndex=1',
    )
  })

  it('disables Previous on page zero and disables Next on the last page', async () => {
    renderSearchResult({
      queryResult: buildQueryResult({ items: 12, hasNextPage: false }),
    })

    await screen.findByText('K.1')
    expect(screen.getAllByRole('listitem')[0]).toHaveClass('disabled')
    expect(screen.getAllByRole('listitem')[2]).toHaveClass('disabled')
    expect(screen.getByText(/Showing results 1-12/)).toBeInTheDocument()
  })

  it('keeps a usable Previous control for an empty directly linked page', async () => {
    renderSearchResult({
      queryResult: buildQueryResult({ items: 0, hasNextPage: false }),
      fragmentQuery: { number: 'K.1', limit: 50, offset: 100, count: 'page' },
    })

    expect(await screen.findByText('No results on this page')).toBeVisible()
    expect(screen.getAllByRole('listitem')[0]).not.toHaveClass('disabled')
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

    const { rerender } = render(
      <MemoryRouter initialEntries={['/library/search/?number=K.1']}>
        <SearchResult
          fragmentService={fragmentService}
          dossiersService={{} as DossiersService}
          fragmentQuery={{ number: 'K.1', limit: 50, offset: 0, count: 'page' }}
        />
      </MemoryRouter>,
    )

    rerender(
      <MemoryRouter initialEntries={['/library/search/?number=K.1']}>
        <SearchResult
          fragmentService={fragmentService}
          dossiersService={{} as DossiersService}
          fragmentQuery={{
            number: 'K.1',
            limit: 50,
            offset: 50,
            count: 'page',
          }}
        />
      </MemoryRouter>,
    )

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

  it('does not display zero when the total line count is unknown', async () => {
    renderSearchResult({
      queryResult: buildQueryResult({ matchCountTotal: null }),
      fragmentQuery: {
        transliteration: 'kur',
        limit: 50,
        offset: 0,
        count: 'page',
      },
    })

    await screen.findByText('K.1')
    expect(screen.queryByText(/0 lines/)).not.toBeInTheDocument()
  })
})
