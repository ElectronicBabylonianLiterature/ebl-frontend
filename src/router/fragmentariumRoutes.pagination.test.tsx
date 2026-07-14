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
import { FragmentQuery } from 'query/FragmentQuery'

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

function buildQueryResult(query: FragmentQuery): QueryResult {
  const first = (query.offset ?? 0) + 1
  return {
    items: [
      {
        museumNumber: `K.${first}`,
        matchingLines: [],
        matchCount: 0,
      },
    ],
    matchCountTotal: null,
    hasNextPage: true,
  }
}

function renderRoutes(initialEntry: string): jest.Mocked<FragmentService> {
  const fragmentService = {
    query: jest.fn((query: FragmentQuery) =>
      Promise.resolve(buildQueryResult(query)),
    ),
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
    <MemoryRouter initialEntries={[initialEntry]}>
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

  return fragmentService
}

describe('FragmentariumRoutes library search pagination', () => {
  it('sends the first explicit-limit page by default', async () => {
    const view = renderRoutes('/library/search/?number=000123')

    expect(await screen.findByText('K.1')).toBeInTheDocument()
    expect(view.query).toHaveBeenCalledWith({
      number: '000123',
      limit: 50,
      offset: 0,
      count: 'page',
    })
  })

  it('direct navigation to paginationIndex=2 sends offset 100 without normalizing search values', async () => {
    const view = renderRoutes(
      '/library/search/?number=000123&genre=CANONICAL%3ATechnical%3AAstronomy%3AAstronomical%20Diaries&paginationIndex=2',
    )

    expect(await screen.findByText('K.101')).toBeInTheDocument()
    expect(view.query).toHaveBeenCalledWith({
      number: '000123',
      genre: 'CANONICAL:Technical:Astronomy:Astronomical Diaries',
      limit: 50,
      offset: 100,
      count: 'page',
    })
  })

  it.each(['abc', '-5', '1.5'])(
    'treats invalid paginationIndex=%s as page zero',
    async (paginationIndex) => {
      const view = renderRoutes(
        `/library/search/?number=K.1&paginationIndex=${paginationIndex}`,
      )

      expect(await screen.findByText('K.1')).toBeInTheDocument()
      expect(view.query).toHaveBeenCalledWith({
        number: 'K.1',
        limit: 50,
        offset: 0,
        count: 'page',
      })
    },
  )

  it('uses URL page changes to request the next server page', async () => {
    const view = renderRoutes(
      '/library/search/?number=000123&paginationIndex=1',
    )

    expect(await screen.findByText('K.51')).toBeInTheDocument()
    expect(view.query).toHaveBeenLastCalledWith({
      number: '000123',
      limit: 50,
      offset: 50,
      count: 'page',
    })

    await userEvent.click(screen.getAllByText('Next')[0])

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent(
        'number=000123&paginationIndex=2',
      )
    })
    expect(await screen.findByText('K.101')).toBeInTheDocument()
    expect(view.query).toHaveBeenLastCalledWith({
      number: '000123',
      limit: 50,
      offset: 100,
      count: 'page',
    })
  })
})
