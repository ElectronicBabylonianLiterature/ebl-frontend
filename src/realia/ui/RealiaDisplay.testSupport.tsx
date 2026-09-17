import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useParams,
} from 'react-router-dom'
import RealiaDisplay from 'realia/ui/RealiaDisplay'
import RealiaService from 'realia/application/RealiaService'
import SessionContext from 'auth/SessionContext'
import MemorySession from 'auth/Session'
import { RealiaEntry } from 'realia/domain/RealiaEntry'

const locationTimeoutInMilliseconds = 5000

export const realiaService = new (RealiaService as jest.Mock<
  jest.Mocked<RealiaService>
>)()

export function renderDisplay(
  entry: RealiaEntry,
  session = new MemorySession(['read:realia']),
): void {
  realiaService.find.mockReturnValue(Promise.resolve(entry))
  render(
    <MemoryRouter>
      <SessionContext.Provider value={session}>
        <RealiaDisplay id={entry.id} realiaService={realiaService} />
      </SessionContext.Provider>
    </MemoryRouter>,
  )
}

function LocationHashProbe(): JSX.Element {
  const location = useLocation()
  return <span data-testid="location-hash">{location.hash}</span>
}

export function renderDisplayWithLocation(
  entry: RealiaEntry,
  initialEntry: string | { pathname: string; hash: string } = '/',
): void {
  realiaService.find.mockReturnValue(Promise.resolve(entry))
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <SessionContext.Provider value={new MemorySession(['read:realia'])}>
        <RealiaDisplay id={entry.id} realiaService={realiaService} />
        <LocationHashProbe />
      </SessionContext.Provider>
    </MemoryRouter>,
  )
}

export function LocationProbe(): JSX.Element {
  const location = useLocation()
  return (
    <span data-testid="location">{`${location.pathname}${location.hash}`}</span>
  )
}

export function RealiaRouteEntry({
  realiaService: service,
}: {
  realiaService: RealiaService
}): JSX.Element {
  const { id } = useParams()
  return (
    <RealiaDisplay id={decodeURIComponent(id ?? '')} realiaService={service} />
  )
}

export function expectLocation(expected: string): void {
  expect(screen.getByTestId('location')).toHaveTextContent(
    new RegExp(`^${expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`),
  )
}

export async function waitForLocation(expected: string): Promise<void> {
  await waitFor(() => expectLocation(expected), {
    timeout: locationTimeoutInMilliseconds,
  })
}

export function renderRealiaRoute(
  service: RealiaService,
  url: string,
): RenderResult {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <SessionContext.Provider value={new MemorySession(['read:realia'])}>
        <Routes>
          <Route
            path="/tools/realia/:id"
            element={<RealiaRouteEntry realiaService={service} />}
          />
        </Routes>
        <LocationProbe />
      </SessionContext.Provider>
    </MemoryRouter>,
  )
}
