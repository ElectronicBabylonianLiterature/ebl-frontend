import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { SearchResult } from './FragmentariumSearchResult'
import FragmentService from 'fragmentarium/application/FragmentService'
import DossiersService from 'dossiers/application/DossiersService'
import { QueryItem, QueryResult } from 'query/QueryResult'

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

function buildQueryResult(totalItems = 500): QueryResult {
  return {
    items: Array.from({ length: totalItems }, (_, index) => ({
      museumNumber: `K.${index + 1}`,
      matchingLines: [],
      matchCount: 0,
    })),
    matchCountTotal: 0,
  }
}

function renderSearchResult(search = ''): jest.Mocked<FragmentService> {
  const fragmentService = {
    query: jest.fn().mockResolvedValue(buildQueryResult()),
  } as unknown as jest.Mocked<FragmentService>

  render(
    <MemoryRouter initialEntries={[`/library/search/${search}`]}>
      <LocationDisplay />
      <SearchResult
        fragmentService={fragmentService}
        dossiersService={{} as DossiersService}
        fragmentQuery={{ number: 'K.1' }}
      />
    </MemoryRouter>,
  )

  return fragmentService
}

describe('FragmentariumSearchResult pagination', () => {
  it('starts on page 6 when paginationIndex=5', async () => {
    renderSearchResult('?paginationIndex=5')

    expect(await screen.findByText('K.251')).toBeInTheDocument()
    expect(screen.queryByText('K.1')).not.toBeInTheDocument()
  })

  it('updates the URL when clicking page 10', async () => {
    renderSearchResult()

    await screen.findByText('K.1')
    await userEvent.click(screen.getAllByRole('button', { name: '10' })[0])

    expect(await screen.findByText('K.451')).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent(
      'paginationIndex=9',
    )
  })

  it.each(['?paginationIndex=abc', '?paginationIndex=-5'])(
    'defaults to page 1 for invalid pagination value %s',
    async (search) => {
      renderSearchResult(search)

      expect(await screen.findByText('K.1')).toBeInTheDocument()
      expect(screen.queryByText('K.51')).not.toBeInTheDocument()
    },
  )

  it('clamps out-of-range paginationIndex to the last page', async () => {
    renderSearchResult('?paginationIndex=9999')

    expect(await screen.findByText('K.451')).toBeInTheDocument()
    expect(screen.queryByText('K.1')).not.toBeInTheDocument()
  })
})
