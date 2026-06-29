import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Bluebird from 'bluebird'
import RealiaSearchPage from 'realia/ui/RealiaSearchPage'
import RealiaService from 'realia/application/RealiaService'
import SessionContext from 'auth/SessionContext'
import MemorySession from 'auth/Session'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'
import {
  realiaEntryFactory,
  reallexikonEntryFactory,
  afoRegisterEntryFactory,
} from 'test-support/realia-fixtures'
import { referenceFactory } from 'test-support/bibliography-fixtures'
import { RealiaEntry } from 'realia/domain/RealiaEntry'

jest.mock('realia/application/RealiaService')

const realiaService = new (RealiaService as jest.Mock<
  jest.Mocked<RealiaService>
>)()

const richEntry: RealiaEntry = realiaEntryFactory.build({
  id: 'Enlil, Ellil',
  realiaId: 'realia_enlil',
  type: ['Divine names', 'Celestial names'],
  relatedTerms: ['Elil', 'Illil'],
  reallexikon: reallexikonEntryFactory.buildList(1),
  afoRegister: afoRegisterEntryFactory.buildList(2),
  references: referenceFactory.buildList(5),
  wikidataId: ['Q79064'],
})

async function renderProtectedSearch(
  session = new MemorySession(['read:realia']),
  entries: readonly RealiaEntry[] = [richEntry],
): Promise<void> {
  realiaService.search.mockReturnValue(Bluebird.resolve(entries))
  render(
    <MemoryRouter initialEntries={['/tools/realia?query=enlil']}>
      <SessionContext.Provider value={session}>
        <RealiaSearchPage realiaService={realiaService} />
      </SessionContext.Provider>
    </MemoryRouter>,
  )
  await waitForSpinnerToBeRemoved(screen)
}

describe('Realia search page (read:realia scope)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the rich preview for a result behind the scope gate', async () => {
    await renderProtectedSearch()
    const item = screen.getByRole('listitem')

    expect(
      within(item).getByRole('link', { name: 'Enlil, Ellil' }),
    ).toHaveAttribute(
      'href',
      `/tools/realia/${encodeURIComponent('Enlil, Ellil')}`,
    )
    expect(within(item).getByText('Divine names')).toBeInTheDocument()
    expect(within(item).getByText('Celestial names')).toBeInTheDocument()
    expect(within(item).getByText('Elil, Illil')).toBeInTheDocument()
    expect(within(item).getByText('RlA')).toBeInTheDocument()
    expect(within(item).getByText('AfO')).toBeInTheDocument()
    expect(within(item).getByText('References')).toBeInTheDocument()
    expect(within(item).getByText('Wikidata')).toBeInTheDocument()
    expect(
      within(item)
        .getAllByText(/^\(\d+\)$/)
        .map((node) => node.textContent),
    ).toEqual(['(1)', '(2)', '(5)'])
  })

  it('matches the rendered rich-preview markup', async () => {
    await renderProtectedSearch()
    expect(screen.getByRole('list')).toMatchSnapshot()
  })

  it('hides results and shows the login message without the scope', async () => {
    await renderProtectedSearch(new MemorySession([]))
    expect(
      screen.getByText('Please log in to browse the Dictionary of Realia.'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })
})
