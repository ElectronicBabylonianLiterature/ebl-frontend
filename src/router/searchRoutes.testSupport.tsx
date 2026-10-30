import React from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Switch } from 'router/compat'
import SessionContext from 'auth/SessionContext'
import MemorySession from 'auth/Session'
import FragmentariumRoutes from 'router/fragmentariumRoutes'
import ResearchProjectRoutes from 'router/researchProjectRoutes'
import FragmentService from 'fragmentarium/application/FragmentService'
import { FragmentQuery } from 'query/FragmentQuery'
import { QueryResult } from 'query/QueryResult'
import { getServices } from 'test-support/AppDriver'
import LocationDisplay from 'test-support/LocationDisplay'

export type QueryResultBuilder = (query: FragmentQuery) => QueryResult

function createServices(
  buildQueryResult: QueryResultBuilder,
): ReturnType<typeof getServices> {
  const services = getServices()
  jest
    .spyOn(services.fragmentService, 'query')
    .mockImplementation((query: FragmentQuery) =>
      Promise.resolve(buildQueryResult(query)),
    )
  jest.spyOn(services.fragmentService, 'fetchPeriods').mockResolvedValue([])
  jest.spyOn(services.fragmentService, 'fetchGenres').mockResolvedValue([])
  jest.spyOn(services.fragmentService, 'fetchProvenances').mockResolvedValue([])
  jest
    .spyOn(services.textService, 'query')
    .mockResolvedValue({ items: [], matchCountTotal: 0 })
  jest
    .spyOn(services.dossiersService, 'fetchFilteredDossiers')
    .mockResolvedValue([])
  jest.spyOn(services.wordService, 'findAll').mockResolvedValue([])
  return services
}

function renderRoutes(
  initialEntry: string,
  routes: JSX.Element[],
  extraContent?: React.ReactNode,
): void {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <SessionContext.Provider value={new MemorySession(['read:fragments'])}>
        <LocationDisplay />
        {extraContent}
        <Switch>{routes}</Switch>
      </SessionContext.Provider>
    </MemoryRouter>,
  )
}

export function renderLibrarySearch(
  initialEntry: string,
  buildQueryResult: QueryResultBuilder,
  extraContent?: React.ReactNode,
): FragmentService {
  const services = createServices(buildQueryResult)

  renderRoutes(
    initialEntry,
    FragmentariumRoutes({ ...services, sitemap: false }),
    extraContent,
  )

  return services.fragmentService
}

export function renderProjectSearch(
  initialEntry: string,
  buildQueryResult: QueryResultBuilder,
): FragmentService {
  const services = createServices(buildQueryResult)

  renderRoutes(
    initialEntry,
    ResearchProjectRoutes({ ...services, sitemap: false }),
  )

  return services.fragmentService
}
