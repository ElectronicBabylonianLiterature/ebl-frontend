import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RealiaDisplay from 'realia/ui/RealiaDisplay'
import SessionContext from 'auth/SessionContext'
import MemorySession from 'auth/Session'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'
import {
  realiaEntryFactory,
  realiaCrossReferenceFactory,
} from 'test-support/realia-fixtures'
import { installMockIntersectionObserver } from 'test-support/intersectionObserverMock'
import {
  realiaService,
  renderDisplay,
} from 'realia/ui/RealiaDisplay.testSupport'

jest.mock('realia/application/RealiaService')

describe('RealiaDisplay cross-references and access', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    installMockIntersectionObserver()
  })

  it('renders the See Also section with links for cross-references', async () => {
    const entry = realiaEntryFactory.build({
      crossReferences: [
        realiaCrossReferenceFactory.build({ id: 'realia_1', lemma: 'Anu' }),
      ],
      afoCrossReferences: [
        realiaCrossReferenceFactory.build({ id: 'realia_2', lemma: 'Enlil' }),
      ],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.getByText('IV. See Also')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Anu' })).toHaveAttribute(
      'href',
      '/tools/realia/Anu',
    )
    expect(screen.getByRole('link', { name: 'Enlil' })).toHaveAttribute(
      'href',
      '/tools/realia/Enlil',
    )
  })

  it('omits the See Also section when there are no cross-references', async () => {
    const entry = realiaEntryFactory.build({
      crossReferences: [],
      afoCrossReferences: [],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.queryByText(/IV\. See Also/)).not.toBeInTheDocument()
  })

  it('renders a redirect document as a pointer to its target lemma', async () => {
    const entry = realiaEntryFactory.build({
      id: 'Abaralaḫ',
      reallexikon: [],
      afoRegister: [],
      references: [],
      crossReferences: [
        realiaCrossReferenceFactory.build({
          id: 'realia_nusku',
          lemma: 'Nusku',
        }),
      ],
      afoCrossReferences: [],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Abaralaḫ' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Nusku' })).toHaveAttribute(
      'href',
      '/tools/realia/Nusku',
    )
    expect(screen.queryByText(/IV\. See Also/)).not.toBeInTheDocument()
    expect(
      screen.queryByRole('navigation', { name: 'On this page' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByText(/still under active development/i),
    ).toBeInTheDocument()
  })

  it('does not render an AppContent-generated h2 heading', async () => {
    const entry = realiaEntryFactory.build()
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(
      screen.queryByRole('heading', { level: 2, name: entry.id }),
    ).not.toBeInTheDocument()
  })

  it('re-fetches and renders the new entry when the id changes', async () => {
    const first = realiaEntryFactory.build({ id: 'Pig' })
    const second = realiaEntryFactory.build({ id: 'Anu' })
    realiaService.find.mockImplementation((id: string) =>
      Promise.resolve(id === 'Anu' ? second : first),
    )
    const session = new MemorySession(['read:realia'])
    const { rerender } = render(
      <MemoryRouter>
        <SessionContext.Provider value={session}>
          <RealiaDisplay id="Pig" realiaService={realiaService} />
        </SessionContext.Provider>
      </MemoryRouter>,
    )
    await waitForSpinnerToBeRemoved(screen)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Pig' }),
    ).toBeInTheDocument()

    rerender(
      <MemoryRouter>
        <SessionContext.Provider value={session}>
          <RealiaDisplay id="Anu" realiaService={realiaService} />
        </SessionContext.Provider>
      </MemoryRouter>,
    )
    await waitForSpinnerToBeRemoved(screen)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Anu' }),
    ).toBeInTheDocument()
    expect(realiaService.find).toHaveBeenCalledWith(
      'Anu',
      expect.any(AbortSignal),
    )
  })

  it('shows the development notice for an authorized session', async () => {
    const entry = realiaEntryFactory.build()
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(
      screen.getByText(/still under active development/i),
    ).toBeInTheDocument()
  })

  it('shows login message when session lacks readRealia scope', async () => {
    const entry = realiaEntryFactory.build()
    renderDisplay(entry, new MemorySession([]))
    await waitForSpinnerToBeRemoved(screen)
    expect(
      screen.getByText('Please log in to browse the Dictionary of Realia.'),
    ).toBeInTheDocument()
    expect(
      screen.queryByText(/still under active development/i),
    ).not.toBeInTheDocument()
  })
})
