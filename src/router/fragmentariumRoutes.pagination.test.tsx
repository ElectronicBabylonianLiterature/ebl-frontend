import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { Switch } from 'router/compat'
import SessionContext from 'auth/SessionContext'
import MemorySession from 'auth/Session'
import FragmentariumRoutes from './fragmentariumRoutes'
import FragmentService from 'fragmentarium/application/FragmentService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import BibliographyService from 'bibliography/application/BibliographyService'
import WordService from 'dictionary/application/WordService'
import TextService from 'corpus/application/TextService'
import DossiersService from 'dossiers/application/DossiersService'
import { QueryItem, QueryResult } from 'query/QueryResult'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import SignService from 'signs/application/SignService'

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

describe('FragmentariumRoutes library search pagination', () => {
  it('keeps paginationIndex out of the backend query and does not refetch on page changes', async () => {
    const fragmentService = {
      query: jest.fn().mockResolvedValue(buildQueryResult()),
      fetchPeriods: jest.fn().mockResolvedValue([]),
      fetchGenres: jest.fn().mockResolvedValue([]),
      fetchProvenances: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<FragmentService>
    const textService = {
      query: jest.fn().mockResolvedValue({ items: [], matchCountTotal: 0 }),
    } as unknown as jest.Mocked<TextService>
    const dossiersService = {
      fetchFilteredDossiers: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<DossiersService>
    const wordService = {
      findAll: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<WordService>

    render(
      <MemoryRouter
        initialEntries={['/library/search/?number=K.1&paginationIndex=5']}
      >
        <SessionContext.Provider value={new MemorySession(['read:fragments'])}>
          <LocationDisplay />
          <Switch>
            {FragmentariumRoutes({
              sitemap: false,
              fragmentService,
              fragmentSearchService: {} as FragmentSearchService,
              textService,
              wordService,
              findspotService: {} as FindspotService,
              afoRegisterService: {} as AfoRegisterService,
              dossiersService,
              signService: {} as SignService,
              bibliographyService: {} as BibliographyService,
            })}
          </Switch>
        </SessionContext.Provider>
      </MemoryRouter>,
    )

    expect(await screen.findByText('K.251')).toBeInTheDocument()
    expect(fragmentService.query).toHaveBeenCalledWith({ number: 'K.1' })
    expect(fragmentService.query).toHaveBeenCalledTimes(1)

    await userEvent.click(screen.getAllByRole('button', { name: '10' })[0])

    expect(await screen.findByText('K.451')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent(
        'paginationIndex=9',
      )
    })
    expect(fragmentService.query).toHaveBeenCalledTimes(1)
  })
})
