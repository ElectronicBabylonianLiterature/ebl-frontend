import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useParams,
} from 'react-router-dom'
import Bluebird from 'bluebird'
import SessionContext from 'auth/SessionContext'
import MemorySession from 'auth/Session'
import RealiaDisplay from 'realia/ui/RealiaDisplay'
import { RealiaEntry } from 'realia/domain/RealiaEntry'
import { realiaService } from 'realia/ui/RealiaDisplay.testSupport'
import { realiaSectionIds } from 'realia/ui/realiaSections'
import { installMockIntersectionObserver } from 'test-support/intersectionObserverMock'
import { realiaEntryFactory } from 'test-support/realia-fixtures'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'

jest.mock('realia/application/RealiaService')

const lemma = 'Apkallu'
const realiaId = 'realia_000846'

function LocationProbe(): JSX.Element {
  const location = useLocation()
  return (
    <span data-testid="location">{`${location.pathname}${location.hash}`}</span>
  )
}

function RealiaRouteEntry(): JSX.Element {
  const { id } = useParams()
  return (
    <RealiaDisplay
      id={decodeURIComponent(id ?? '')}
      realiaService={realiaService}
    />
  )
}

function renderAtUrl(entry: RealiaEntry, url: string): void {
  realiaService.find.mockReturnValue(Bluebird.resolve(entry))
  render(
    <MemoryRouter initialEntries={[url]}>
      <SessionContext.Provider value={new MemorySession(['read:realia'])}>
        <Routes>
          <Route path="/tools/realia/:id" element={<RealiaRouteEntry />} />
        </Routes>
        <LocationProbe />
      </SessionContext.Provider>
    </MemoryRouter>,
  )
}

function expectLocation(expected: string): void {
  expect(screen.getByTestId('location')).toHaveTextContent(
    new RegExp(`^${expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`),
  )
}

describe('a realia id URL redirects to the lemma URL', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    installMockIntersectionObserver()
  })

  it('replaces the realia id in the path with the lemma', async () => {
    renderAtUrl(
      realiaEntryFactory.build({ id: lemma, realiaId }),
      `/tools/realia/${realiaId}`,
    )

    await waitFor(() => expectLocation(`/tools/realia/${lemma}`))
  })

  it('resolves the entry by realia id, then re-resolves it by lemma', async () => {
    renderAtUrl(
      realiaEntryFactory.build({ id: lemma, realiaId }),
      `/tools/realia/${realiaId}`,
    )

    await waitFor(() => expectLocation(`/tools/realia/${lemma}`))
    expect(realiaService.find).toHaveBeenCalledWith(realiaId)
    expect(realiaService.find).toHaveBeenCalledWith(lemma)
  })

  it('renders the entry once it has redirected', async () => {
    renderAtUrl(
      realiaEntryFactory.build({ id: lemma, realiaId }),
      `/tools/realia/${realiaId}`,
    )

    await waitForSpinnerToBeRemoved(screen)
    expect(
      await screen.findByRole('heading', { level: 1, name: lemma }),
    ).toBeInTheDocument()
  })

  it('keeps a section hash across the redirect', async () => {
    const hash = `#${realiaSectionIds.afoRegister}`
    renderAtUrl(
      realiaEntryFactory.build({ id: lemma, realiaId }),
      `/tools/realia/${realiaId}${hash}`,
    )

    await waitFor(() => expectLocation(`/tools/realia/${lemma}${hash}`))
  })
})

describe('a canonical URL is left alone', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    installMockIntersectionObserver()
  })

  it('does not redirect a lemma URL', async () => {
    renderAtUrl(
      realiaEntryFactory.build({ id: lemma, realiaId }),
      `/tools/realia/${lemma}`,
    )

    await waitForSpinnerToBeRemoved(screen)
    expectLocation(`/tools/realia/${lemma}`)
    expect(realiaService.find).toHaveBeenCalledTimes(1)
  })

  it('does not loop when the entry id is itself the requested realia id', async () => {
    renderAtUrl(
      realiaEntryFactory.build({ id: realiaId, realiaId }),
      `/tools/realia/${realiaId}`,
    )

    await waitForSpinnerToBeRemoved(screen)
    expectLocation(`/tools/realia/${realiaId}`)
    expect(realiaService.find).toHaveBeenCalledTimes(1)
  })
})
