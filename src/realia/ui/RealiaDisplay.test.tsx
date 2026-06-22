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
  realiaCrossReferenceFactory,
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

  it('omits Reallexikon section when reallexikon is empty', async () => {
    const entry = realiaEntryFactory.build({ reallexikon: [] })
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

  it('renders reallexikon entry with a reference', async () => {
    const reference = referenceFactory.build()
    const reallexikonEntry = reallexikonEntryFactory.build({
      references: [reference],
    })
    const entry = realiaEntryFactory.build({
      reallexikon: [reallexikonEntry],
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
    const entry = realiaEntryFactory.build({ reallexikon: [reallexikonEntry] })
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

  it('groups afo entries that share a volume into one collapsible card', async () => {
    const entry = realiaEntryFactory.build({
      reallexikon: [],
      afoRegister: [
        afoRegisterEntryFactory.build({
          mainWord: 'Tiamat',
          AfO: 'AfO 25 (1974-1977), 370',
        }),
        afoRegisterEntryFactory.build({
          mainWord: 'Apsû',
          AfO: 'AfO 25 (1974-1977), 372',
        }),
      ],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.getByText('AfO 25 (1974-1977)')).toBeInTheDocument()
    expect(screen.getAllByTestId('CollapseIndicator')).toHaveLength(1)
    expect(screen.getByText('Tiamat')).toBeInTheDocument()
    expect(screen.getByText('Apsû')).toBeInTheDocument()
  })

  it('renders a separate collapsible card per distinct volume', async () => {
    const entry = realiaEntryFactory.build({
      reallexikon: [],
      afoRegister: [
        afoRegisterEntryFactory.build({ AfO: 'AfO 25 (1974-1977), 370' }),
        afoRegisterEntryFactory.build({ AfO: 'AfO 26 (1978-1979), 12' }),
      ],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.getByText('AfO 25 (1974-1977)')).toBeInTheDocument()
    expect(screen.getByText('AfO 26 (1978-1979)')).toBeInTheDocument()
    expect(screen.getAllByTestId('CollapseIndicator')).toHaveLength(2)
  })

  it('renders each volume card collapsed by default', async () => {
    const afoEntry = afoRegisterEntryFactory.build({
      AfO: 'AfO 25 (1974-1977), 370',
    })
    const entry = realiaEntryFactory.build({
      reallexikon: [],
      afoRegister: [afoEntry],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.getByTestId('CollapseIndicator')).toHaveClass('fa-angle-down')
  })

  it('does not duplicate the "AfO" prefix in the volume header', async () => {
    const afoEntry = afoRegisterEntryFactory.build({
      AfO: 'AfO 25 (1974-1977), 370',
    })
    const entry = realiaEntryFactory.build({ afoRegister: [afoEntry] })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.getByText('AfO 25 (1974-1977)')).toBeInTheDocument()
    expect(screen.queryByText(/AfO AfO/)).not.toBeInTheDocument()
  })

  it('adds the "AfO" prefix to the volume header when the backend value omits it', async () => {
    const afoEntry = afoRegisterEntryFactory.build({ AfO: '99 (2000), 5' })
    const entry = realiaEntryFactory.build({ afoRegister: [afoEntry] })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.getByText('AfO 99 (2000)')).toBeInTheDocument()
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

  it('renders "Type:" label with the backend type value verbatim', async () => {
    const entry = realiaEntryFactory.build({ type: ['Divine names'] })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.getByText('Type:')).toBeInTheDocument()
    expect(screen.getByText('Divine names')).toBeInTheDocument()
  })

  it('moves the RlA reference into the Reallexikon section and hides References', async () => {
    const reference = referenceFactory.build()
    const reallexikonEntry = reallexikonEntryFactory.build({
      references: [reference],
    })
    const entry = realiaEntryFactory.build({
      reallexikon: [reallexikonEntry],
      references: [],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.getByText(/I\. Reallexikon/)).toBeInTheDocument()
    expect(screen.queryByText(/III\. References/)).not.toBeInTheDocument()
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
