import React from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import RealiaDisplay from 'realia/ui/RealiaDisplay'
import RealiaService from 'realia/application/RealiaService'
import SessionContext from 'auth/SessionContext'
import MemorySession from 'auth/Session'
import { RealiaEntry } from 'realia/domain/RealiaEntry'

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
