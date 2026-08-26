import React from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { Switch } from 'router/compat'
import SessionContext from 'auth/SessionContext'
import MemorySession from 'auth/Session'
import FragmentariumRoutes from 'router/fragmentariumRoutes'
import ResearchProjectRoutes from 'router/researchProjectRoutes'
import FragmentService from 'fragmentarium/application/FragmentService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import BibliographyService from 'bibliography/application/BibliographyService'
import WordService from 'dictionary/application/WordService'
import TextService from 'corpus/application/TextService'
import DossiersService from 'dossiers/application/DossiersService'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import SignService from 'signs/application/SignService'
import { FragmentQuery } from 'query/FragmentQuery'
import { QueryResult } from 'query/QueryResult'

export type QueryResultBuilder = (query: FragmentQuery) => QueryResult

export function LocationDisplay(): JSX.Element {
  const location = useLocation()
  return <div data-testid="location">{location.search}</div>
}

function createServices(buildQueryResult: QueryResultBuilder) {
  return {
    fragmentService: {
      query: jest.fn((query: FragmentQuery) =>
        Promise.resolve(buildQueryResult(query)),
      ),
      find: jest.fn(),
      fetchPeriods: jest.fn().mockResolvedValue([]),
      fetchGenres: jest.fn().mockResolvedValue([]),
      fetchProvenances: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<FragmentService>,
    textService: {
      query: jest.fn().mockResolvedValue({ items: [], matchCountTotal: 0 }),
    } as unknown as jest.Mocked<TextService>,
    dossiersService: {
      fetchFilteredDossiers: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<DossiersService>,
    wordService: {
      findAll: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<WordService>,
  }
}

function renderRoutes(initialEntry: string, routes: JSX.Element[]): void {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <SessionContext.Provider value={new MemorySession(['read:fragments'])}>
        <LocationDisplay />
        <Switch>{routes}</Switch>
      </SessionContext.Provider>
    </MemoryRouter>,
  )
}

export function renderLibrarySearch(
  initialEntry: string,
  buildQueryResult: QueryResultBuilder,
): jest.Mocked<FragmentService> {
  const { fragmentService, textService, dossiersService, wordService } =
    createServices(buildQueryResult)

  renderRoutes(
    initialEntry,
    FragmentariumRoutes({
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
    }),
  )

  return fragmentService
}

export function renderProjectSearch(
  initialEntry: string,
  buildQueryResult: QueryResultBuilder,
): jest.Mocked<FragmentService> {
  const { fragmentService, dossiersService, wordService } =
    createServices(buildQueryResult)

  renderRoutes(
    initialEntry,
    ResearchProjectRoutes({
      sitemap: false,
      fragmentService,
      fragmentSearchService: {} as FragmentSearchService,
      wordService,
      bibliographyService: {} as BibliographyService,
      dossiersService,
    }),
  )

  return fragmentService
}
