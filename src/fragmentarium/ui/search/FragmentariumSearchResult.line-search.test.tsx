import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SearchResult } from 'fragmentarium/ui/search/FragmentariumSearchResult'
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

function renderLineSearchResult({
  queryResult = buildQueryResult(),
  fragmentQuery = {
    transliteration: 'kur',
    limit: 51,
    offset: 0,
    count: 'exact' as const,
  },
  resultPageSize = 50,
}: {
  queryResult?: QueryResult
  fragmentQuery?: FragmentQuery
  resultPageSize?: number
} = {}): void {
  const fragmentService = {
    query: jest.fn().mockResolvedValue(queryResult),
  } as unknown as jest.Mocked<FragmentService>

  render(
    <MemoryRouter initialEntries={['/library/search/?transliteration=kur']}>
      <SearchResult
        fragmentService={fragmentService}
        dossiersService={{} as DossiersService}
        fragmentQuery={fragmentQuery}
        resultPageSize={resultPageSize}
      />
    </MemoryRouter>,
  )
}

describe('FragmentariumSearchResult line-search counts', () => {
  it('does not display zero when the total line count is unknown', async () => {
    renderLineSearchResult({
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

  it('separates exact line totals from page-size document ranges', async () => {
    renderLineSearchResult({
      queryResult: {
        ...buildQueryResult({ matchCountTotal: 90, hasNextPage: true }),
        isMatchCountTotalExact: true,
      },
      fragmentQuery: {
        transliteration: 'kur',
        limit: 51,
        offset: 0,
        count: 'exact',
      },
      resultPageSize: 50,
    })

    expect(await screen.findByText('K.1')).toBeInTheDocument()
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
    renderLineSearchResult({
      queryResult: {
        ...buildQueryResult({ items: 51, matchCountTotal: 90 }),
        hasNextPage: null,
        isMatchCountTotalExact: true,
      },
      fragmentQuery: {
        transliteration: 'kur',
        limit: 51,
        offset: 0,
        count: 'exact',
      },
      resultPageSize: 50,
    })

    expect(await screen.findByText('K.1')).toBeInTheDocument()
    expect(screen.queryByText('K.51')).not.toBeInTheDocument()
    expect(screen.getAllByRole('listitem')[2]).not.toHaveClass('disabled')
  })

  it('honors explicit false backend pagination metadata for line searches', async () => {
    renderLineSearchResult({
      queryResult: {
        ...buildQueryResult({ items: 51, matchCountTotal: 90 }),
        hasNextPage: false,
        isMatchCountTotalExact: true,
      },
      fragmentQuery: {
        transliteration: 'kur',
        limit: 51,
        offset: 0,
        count: 'exact',
      },
      resultPageSize: 50,
    })

    expect(await screen.findByText('K.1')).toBeInTheDocument()
    expect(screen.queryByText('K.51')).not.toBeInTheDocument()
    expect(screen.getAllByRole('listitem')[2]).toHaveClass('disabled')
  })

  it('shows singular approximate line totals on later pages', async () => {
    renderLineSearchResult({
      queryResult: {
        ...buildQueryResult({
          items: 1,
          matchCountTotal: 1,
          hasNextPage: false,
        }),
        isMatchCountTotalExact: false,
      },
      fragmentQuery: {
        lemmas: 'kur I',
        limit: 26,
        offset: 50,
        count: 'exact',
      },
      resultPageSize: 25,
    })

    expect(await screen.findByText('K.1')).toBeInTheDocument()
    expect(
      screen.getByText('Found about 1 matching line. Showing documents 51-51'),
    ).toBeInTheDocument()
  })
})
