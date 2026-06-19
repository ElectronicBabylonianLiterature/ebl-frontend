import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RealiaDisplay from 'realia/ui/RealiaDisplay'
import RealiaService from 'realia/application/RealiaService'
import SessionContext from 'auth/SessionContext'
import MemorySession from 'auth/Session'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'
import Bluebird from 'bluebird'
import {
  realiaEntryFactory,
  reallexikonEntryFactory,
  afoRegisterEntryFactory,
} from 'test-support/realia-fixtures'
import { RealiaEntry } from 'realia/domain/RealiaEntry'
import { referenceFactory } from 'test-support/bibliography-fixtures'

jest.mock('realia/application/RealiaService')

const realiaService = new (RealiaService as jest.Mock<
  jest.Mocked<RealiaService>
>)()

function renderDisplay(
  entry: RealiaEntry,
  session = new MemorySession(['read:realia']),
): void {
  realiaService.find.mockReturnValue(Bluebird.resolve(entry))
  render(
    <MemoryRouter>
      <SessionContext.Provider value={session}>
        <RealiaDisplay id={entry.id} realiaService={realiaService} />
      </SessionContext.Provider>
    </MemoryRouter>,
  )
}

describe('RealiaDisplay', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all sections for a full entry', async () => {
    const entry = realiaEntryFactory.build()
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(
      screen.getByRole('heading', { level: 1, name: entry.id }),
    ).toBeInTheDocument()
    expect(screen.getByText(/I\. Reallexikon/)).toBeInTheDocument()
    expect(screen.getByText(/II\. AfO-Register/)).toBeInTheDocument()
  })

  it('renders breadcrumbs with Realia section and entry id', async () => {
    const entry = realiaEntryFactory.build()
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.getByText('Realia')).toBeInTheDocument()
    expect(
      screen.getByText(entry.id, { selector: '.breadcrumb-item' }),
    ).toBeInTheDocument()
  })

  it('renders Wikidata ExternalLink with correct href', async () => {
    const entry = realiaEntryFactory.build({ wikidataId: ['Q787'] })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    const link = screen.getByRole('link', { name: 'Wikidata: Q787' })
    expect(link).toHaveAttribute('href', 'https://www.wikidata.org/wiki/Q787')
  })

  it('shows dash when type is empty', async () => {
    const entry = realiaEntryFactory.build({ type: [] })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('omits Reallexikon section when reallexikon is null', async () => {
    const entry = realiaEntryFactory.build({ reallexikon: null })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.queryByText(/I\. Reallexikon/)).not.toBeInTheDocument()
  })

  it('omits AfO-Register section when afoRegister is empty', async () => {
    const entry = realiaEntryFactory.build({ afoRegister: [] })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.queryByText(/II\. AfO-Register/)).not.toBeInTheDocument()
  })

  it('omits References section when references is empty', async () => {
    const entry = realiaEntryFactory.build({ references: [] })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.queryByText(/III\. References/)).not.toBeInTheDocument()
  })

  it('renders reallexikon entry with non-null reference', async () => {
    const reference = referenceFactory.build()
    const reallexikonEntry = reallexikonEntryFactory.build({ reference })
    const entry = realiaEntryFactory.build({
      reallexikon: reallexikonEntry,
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.getByText(/I\. Reallexikon/)).toBeInTheDocument()
  })

  it('renders reallexikon label without parentheses when content is empty', async () => {
    const reallexikonEntry = reallexikonEntryFactory.build({
      title: 'Ab(a)kûia',
      content: '',
    })
    const entry = realiaEntryFactory.build({ reallexikon: reallexikonEntry })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.getByText('Ab(a)kûia')).toBeInTheDocument()
  })

  it('renders afo entry without note', async () => {
    const afoEntry = afoRegisterEntryFactory.build({ note: '' })
    const entry = realiaEntryFactory.build({ afoRegister: [afoEntry] })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.getByText(/II\. AfO-Register/)).toBeInTheDocument()
  })

  it('renders References section when references are present', async () => {
    const reference = referenceFactory.build()
    const entry = realiaEntryFactory.build({ references: [reference] })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.getByText(/III\. References/)).toBeInTheDocument()
  })

  it('renders "Related terms:" label when relatedTerms present', async () => {
    const entry = realiaEntryFactory.build({ relatedTerms: ['pig', 'swine'] })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.getByText('Related terms:')).toBeInTheDocument()
  })

  it('renders "Type:" label with human-readable type value', async () => {
    const entry = realiaEntryFactory.build({ type: ['OBJECT_NAME'] })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.getByText('Type:')).toBeInTheDocument()
    expect(screen.getByText('Object Name')).toBeInTheDocument()
  })

  it('renders crossReference when present', async () => {
    const afoEntry = afoRegisterEntryFactory.build({
      crossReference: 'See Piglet',
    })
    const entry = realiaEntryFactory.build({ afoRegister: [afoEntry] })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.getByText('See also: See Piglet')).toBeInTheDocument()
  })

  it('does not render crossReference paragraph when crossReference is empty', async () => {
    const afoEntry = afoRegisterEntryFactory.build({ crossReference: '' })
    const entry = realiaEntryFactory.build({ afoRegister: [afoEntry] })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.queryByText(/See also:/)).not.toBeInTheDocument()
  })

  it('does not render an AppContent-generated h2 heading', async () => {
    const entry = realiaEntryFactory.build()
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(
      screen.queryByRole('heading', { level: 2, name: entry.id }),
    ).not.toBeInTheDocument()
  })

  it('shows login message when session lacks readRealia scope', async () => {
    const entry = realiaEntryFactory.build()
    renderDisplay(entry, new MemorySession([]))
    await waitForSpinnerToBeRemoved(screen)
    expect(
      screen.getByText('Please log in to browse the Dictionary of Realia.'),
    ).toBeInTheDocument()
  })
})
