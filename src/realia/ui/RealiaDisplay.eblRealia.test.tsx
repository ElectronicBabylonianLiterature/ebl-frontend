import { screen, within } from '@testing-library/react'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'
import {
  afoRegisterEntryFactory,
  eblRealiaEntryFactory,
  realiaEntryFactory,
  reallexikonEntryFactory,
} from 'test-support/realia-fixtures'
import createReference from 'bibliography/application/createReference'
import { jonesReferenceDto } from 'test-support/realia-ebl-fixtures'
import { installMockIntersectionObserver } from 'test-support/intersectionObserverMock'
import { renderDisplay } from 'realia/ui/RealiaDisplay.testSupport'

jest.mock('realia/application/RealiaService')

const jonesReference = createReference(jonesReferenceDto)

const etaPiscium = realiaEntryFactory.build({
  id: 'η Piscium',
  realiaId: 'realia_028434',
  type: ['Astronomy'],
  wikidataId: ['Q14068'],
  reallexikon: [],
  afoRegister: [],
  referenceType: ['eBL'],
  eblRealia: [
    eblRealiaEntryFactory.build({
      id: 'MÚL KUR šá DUR nu-nu',
      transliteration: 'MÚL KUR šá DUR nu-nu',
      translation: 'The bright star of the ribbon of the fishes',
      identification: 'η Psc',
      wikidataId: ['Q14068'],
      reference: jonesReference,
    }),
  ],
})

const lisin = realiaEntryFactory.build({
  id: 'Lisi(n)',
  reallexikon: reallexikonEntryFactory.buildList(1),
  afoRegister: afoRegisterEntryFactory.buildList(1),
  referenceType: ['RlA', 'AfO', 'eBL'],
  eblRealia: [
    eblRealiaEntryFactory.build({
      transliteration: 'SI₄',
      normalisation: 'Lisi',
      translation: '(The god) Lisi',
      identification: 'α Sco',
      wikidataId: ['Q12166'],
      remarks: 'Antares',
    }),
  ],
})

function referenceTypeBadges(): string[] {
  return within(screen.getByRole('group', { name: 'Reference types' }))
    .getAllByText(/^(RlA|AfO|eBL)$/)
    .map((badge) => badge.textContent ?? '')
}

describe('RealiaDisplay eBL Realia', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    installMockIntersectionObserver()
  })

  it('shows only the eBL block for a star', async () => {
    renderDisplay(etaPiscium)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.getByText('III. eBL Realia')).toBeInTheDocument()
    expect(screen.queryByText(/I\. Reallexikon/)).not.toBeInTheDocument()
    expect(screen.queryByText(/II\. AfO-Register/)).not.toBeInTheDocument()
    expect(screen.queryByText(/IV\. References/)).not.toBeInTheDocument()
    expect(
      screen.getByText('The bright star of the ribbon of the fishes'),
    ).toBeInTheDocument()
    expect(screen.getByText('η Psc')).toBeInTheDocument()
    expect(screen.getByText('Celestial Name (CN)')).toBeInTheDocument()
    expect(screen.getByText(/Jones/)).toBeInTheDocument()
    expect(referenceTypeBadges()).toEqual(['eBL'])
  })

  it('links the Wikidata items of the eBL entry', async () => {
    renderDisplay(etaPiscium)
    await waitForSpinnerToBeRemoved(screen)
    const eblArticle = screen.getByRole('article', {
      name: 'MÚL KUR šá DUR nu-nu',
    })
    expect(eblArticle).toHaveAttribute('id', 'ebl-realia-1')
    expect(
      within(eblArticle).getByRole('link', { name: 'Wikidata' }),
    ).toHaveAttribute('href', 'https://www.wikidata.org/wiki/Q14068')
  })

  it('shows Akkadian parts of the transliteration in italics', async () => {
    renderDisplay(etaPiscium)
    await waitForSpinnerToBeRemoved(screen)
    const eblArticle = screen.getByRole('article', {
      name: 'MÚL KUR šá DUR nu-nu',
    })
    expect(
      within(eblArticle).getAllByText(/^(šá|nu)$/, { selector: 'em' }),
    ).toHaveLength(3)
    expect(
      within(eblArticle).queryByText('MÚL', { selector: 'em' }),
    ).not.toBeInTheDocument()
  })

  it('omits the normalisation and remarks when they are empty', async () => {
    renderDisplay(etaPiscium)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.queryByText('Normalisation')).not.toBeInTheDocument()
    expect(screen.queryByText('Remarks')).not.toBeInTheDocument()
  })

  it('shows RlA, AfO and eBL blocks and badges for an attached entry', async () => {
    renderDisplay(lisin)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.getByText(/I\. Reallexikon/)).toBeInTheDocument()
    expect(screen.getByText(/II\. AfO-Register/)).toBeInTheDocument()
    expect(screen.getByText('III. eBL Realia')).toBeInTheDocument()
    expect(screen.getByText('Lisi')).toBeInTheDocument()
    expect(screen.getByText('Antares')).toBeInTheDocument()
    expect(referenceTypeBadges()).toEqual(['RlA', 'AfO', 'eBL'])
  })

  it('lists the eBL entries in the navigation', async () => {
    renderDisplay(lisin)
    await waitForSpinnerToBeRemoved(screen)
    const navMenu = screen.getByRole('navigation', { name: 'On this page' })
    expect(
      within(navMenu).getByRole('link', { name: 'eBL Realia' }),
    ).toBeInTheDocument()
    expect(within(navMenu).getByRole('link', { name: 'SI₄' })).toHaveAttribute(
      'href',
      '#ebl-realia-1',
    )
  })

  it('renders an entry without the new fields as before', async () => {
    const entry = realiaEntryFactory.build({ reallexikon: [], afoRegister: [] })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.queryByText(/eBL Realia/)).not.toBeInTheDocument()
    expect(
      screen.queryByRole('group', { name: 'Reference types' }),
    ).not.toBeInTheDocument()
  })
})
