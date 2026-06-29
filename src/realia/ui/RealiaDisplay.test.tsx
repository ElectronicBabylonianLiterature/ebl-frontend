import { screen } from '@testing-library/react'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'
import {
  realiaEntryFactory,
  reallexikonEntryFactory,
} from 'test-support/realia-fixtures'
import { referenceFactory } from 'test-support/bibliography-fixtures'
import { installMockIntersectionObserver } from 'test-support/intersectionObserverMock'
import { renderDisplay } from 'realia/ui/RealiaDisplay.testSupport'

jest.mock('realia/application/RealiaService')

describe('RealiaDisplay sections and reallexikon', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    installMockIntersectionObserver()
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
      reference,
    })
    const entry = realiaEntryFactory.build({
      reallexikon: [reallexikonEntry],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.getByText(/I\. Reallexikon/)).toBeInTheDocument()
  })

  it('renders multiple reallexikon (RlA) articles on the same page', async () => {
    const entry = realiaEntryFactory.build({
      reallexikon: [
        reallexikonEntryFactory.build({ id: '1069', title: 'Aššur A. Stadt' }),
        reallexikonEntryFactory.build({ id: '1070', title: 'Aššur B. Land' }),
        reallexikonEntryFactory.build({
          id: '1071',
          title: 'Aššur C. Hauptgott',
        }),
      ],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(
      screen.getByText('Aššur A. Stadt', { selector: '.Realia__rla-title' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Aššur B. Land', { selector: '.Realia__rla-title' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Aššur C. Hauptgott', {
        selector: '.Realia__rla-title',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', {
        name: 'Open Aššur A. Stadt on the online RlA',
      }),
    ).toHaveAttribute('href', 'https://publikationen.badw.de/de/rla/index#1069')
    expect(
      screen.getByRole('link', {
        name: 'Open Aššur B. Land on the online RlA',
      }),
    ).toHaveAttribute('href', 'https://publikationen.badw.de/de/rla/index#1070')
    expect(
      screen.getByRole('link', {
        name: 'Open Aššur C. Hauptgott on the online RlA',
      }),
    ).toHaveAttribute('href', 'https://publikationen.badw.de/de/rla/index#1071')
  })

  it('renders every RlA article even when they share an id', async () => {
    const entry = realiaEntryFactory.build({
      reallexikon: [
        reallexikonEntryFactory.build({
          id: 'Sintflut',
          title: 'Sintflut A. Deutsch',
        }),
        reallexikonEntryFactory.build({
          id: 'Sintflut',
          title: 'Sintflut B. English',
        }),
      ],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(
      screen.getByText('Sintflut A. Deutsch', {
        selector: '.Realia__rla-title',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Sintflut B. English', {
        selector: '.Realia__rla-title',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', {
        name: 'Open Sintflut A. Deutsch on the online RlA',
      }),
    ).toHaveAttribute(
      'href',
      'https://publikationen.badw.de/de/rla/index#Sintflut',
    )
    expect(
      screen.getByRole('link', {
        name: 'Open Sintflut B. English on the online RlA',
      }),
    ).toHaveAttribute(
      'href',
      'https://publikationen.badw.de/de/rla/index#Sintflut',
    )
  })

  it('links each reallexikon title to its online RlA article in a new tab', async () => {
    const reallexikonEntry = reallexikonEntryFactory.build({
      id: '12583',
      title: 'Zababa-šuma-iddina',
    })
    const entry = realiaEntryFactory.build({ reallexikon: [reallexikonEntry] })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(
      screen.getByText('Zababa-šuma-iddina', {
        selector: '.Realia__rla-title',
      }),
    ).toBeInTheDocument()
    const link = screen.getByRole('link', {
      name: 'Open Zababa-šuma-iddina on the online RlA',
    })
    expect(link).toHaveAttribute(
      'href',
      'https://publikationen.badw.de/de/rla/index#12583',
    )
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
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
    expect(
      screen.getByText('Divine names', { selector: '.Realia__metadata span' }),
    ).toBeInTheDocument()
  })

  it('shows the Reallexikon section and hides References when there are none', async () => {
    const reference = referenceFactory.build()
    const reallexikonEntry = reallexikonEntryFactory.build({
      reference,
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
})
