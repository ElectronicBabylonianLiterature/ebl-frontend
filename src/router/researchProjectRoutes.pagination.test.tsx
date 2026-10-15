import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { Switch } from 'router/compat'
import SessionContext from 'auth/SessionContext'
import MemorySession from 'auth/Session'
import ResearchProjectRoutes from 'router/researchProjectRoutes'
import FragmentService from 'fragmentarium/application/FragmentService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import BibliographyService from 'bibliography/application/BibliographyService'
import WordService from 'dictionary/application/WordService'
import DossiersService from 'dossiers/application/DossiersService'
import { QueryItem, QueryResult } from 'query/QueryResult'
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
    find: jest.fn(),
    fetchPeriods: jest.fn().mockResolvedValue([]),
    fetchGenres: jest.fn().mockResolvedValue([]),
    fetchProvenances: jest.fn().mockResolvedValue([]),
  } as unknown as jest.Mocked<FragmentService>
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
          {ResearchProjectRoutes({
            sitemap: false,
            fragmentService,
            fragmentSearchService: {} as FragmentSearchService,
            wordService,
            bibliographyService: {} as BibliographyService,
            dossiersService,
          })}
        </Switch>
      </SessionContext.Provider>
    </MemoryRouter>,
  )

  return fragmentService
}

describe('ResearchProjectRoutes search pagination', () => {
  it('requests a bounded first page for a bare project search', async () => {
    const view = renderRoutes('/projects/CAIC/search')

    expect(await screen.findByText('K.1')).toBeInTheDocument()
    expect(view.query).toHaveBeenCalledWith({
      project: 'CAIC',
      limit: 51,
      offset: 0,
      count: 'page',
    })
    expect(view.query).toHaveBeenCalledTimes(1)
  })

  it('renders only the returned page and never hydrates summary-less items', async () => {
    const view = renderRoutes('/projects/CAIC/search')

    expect(await screen.findByText('K.1')).toBeInTheDocument()
    expect(screen.getByText(/Showing documents 1-1/)).toBeInTheDocument()
    expect(view.find).not.toHaveBeenCalled()
  })

  it('sends the page offset for a directly linked later page', async () => {
    const view = renderRoutes('/projects/CAIC/search?paginationIndex=1')

    expect(await screen.findByText('K.51')).toBeInTheDocument()
    expect(view.query).toHaveBeenCalledWith({
      project: 'CAIC',
      limit: 51,
      offset: 50,
      count: 'page',
    })
  })

  it('keeps other project search criteria while paging', async () => {
    const view = renderRoutes(
      '/projects/CAIC/search?number=000123&genre=CANONICAL%3ATechnical&paginationIndex=2',
    )

    expect(await screen.findByText('K.101')).toBeInTheDocument()
    expect(view.query).toHaveBeenCalledWith({
      project: 'CAIC',
      number: '000123',
      genre: 'CANONICAL:Technical',
      limit: 51,
      offset: 100,
      count: 'page',
    })
  })

  it('never forwards paginationIndex to the API', async () => {
    const view = renderRoutes('/projects/CAIC/search?paginationIndex=3')

    expect(await screen.findByText('K.151')).toBeInTheDocument()
    expect(view.query).not.toHaveBeenCalledWith(
      expect.objectContaining({ paginationIndex: expect.anything() }),
    )
  })

  it('honours a URL page size and resets to the first page', async () => {
    const view = renderRoutes(
      '/projects/CAIC/search?limit=25&paginationIndex=0',
    )

    expect(await screen.findByText('K.1')).toBeInTheDocument()
    expect(view.query).toHaveBeenCalledWith({
      project: 'CAIC',
      limit: 26,
      offset: 0,
      count: 'page',
    })
  })

  it('requests the next server page when Next is used', async () => {
    const view = renderRoutes('/projects/CAIC/search')

    expect(await screen.findByText('K.1')).toBeInTheDocument()
    await userEvent.click(screen.getAllByText('Next')[0])

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent(
        'paginationIndex=1',
      )
    })
    expect(await screen.findByText('K.51')).toBeInTheDocument()
    expect(view.query).toHaveBeenLastCalledWith({
      project: 'CAIC',
      limit: 51,
      offset: 50,
      count: 'page',
    })
  })

  it('jumps to a requested page by offset', async () => {
    const view = renderRoutes('/projects/RECC/search')

    expect(await screen.findByText('K.1')).toBeInTheDocument()
    await userEvent.type(screen.getAllByLabelText('Go to page')[0], '4')
    await userEvent.click(screen.getAllByText('Go')[0])

    expect(await screen.findByText('K.151')).toBeInTheDocument()
    expect(view.query).toHaveBeenLastCalledWith({
      project: 'RECC',
      limit: 51,
      offset: 150,
      count: 'page',
    })
  })

  it('resets to the first page when the page size changes', async () => {
    const view = renderRoutes('/projects/AMPS/search?paginationIndex=2')

    expect(await screen.findByText('K.101')).toBeInTheDocument()
    await userEvent.selectOptions(
      screen.getAllByLabelText('Results per page')[0],
      '25',
    )

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent(
        'paginationIndex=0',
      )
    })
    expect(view.query).toHaveBeenLastCalledWith({
      project: 'AMPS',
      limit: 26,
      offset: 0,
      count: 'page',
    })
  })

  it('paginates aluGeneva through the same bounded query', async () => {
    const view = renderRoutes('/projects/aluGeneva/search?paginationIndex=1')

    expect(await screen.findByText('K.51')).toBeInTheDocument()
    expect(view.query).toHaveBeenCalledWith({
      project: 'aluGeneva',
      limit: 51,
      offset: 50,
      count: 'page',
    })
  })
})
