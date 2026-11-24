import { screen, within } from '@testing-library/react'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'
import {
  eblRealiaEntryFactory,
  realiaEntryFactory,
} from 'test-support/realia-fixtures'
import { installMockIntersectionObserver } from 'test-support/intersectionObserverMock'
import { renderDisplay } from 'realia/ui/RealiaDisplay.testSupport'
import { EblRealiaEntry } from 'realia/domain/RealiaEntry'

jest.mock('realia/application/RealiaService')

const idOnlyEntry: EblRealiaEntry = {
  id: 'SI₄',
  transliteration: '',
  normalisation: '',
  translation: '',
  identification: '',
  pos: '',
  wikidataId: [],
  reference: null,
  remarks: '',
}

function renderEblEntries(eblRealia: readonly EblRealiaEntry[]): void {
  renderDisplay(
    realiaEntryFactory.build({
      reallexikon: [],
      afoRegister: [],
      referenceType: ['eBL'],
      eblRealia,
    }),
  )
}

function fieldLabels(article: HTMLElement): string[] {
  return within(article)
    .queryAllByRole('term')
    .map((term) => term.textContent ?? '')
}

describe('RealiaDisplay eBL Realia fields', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    installMockIntersectionObserver()
  })

  it('names an entry that only has an ID by its ID', async () => {
    renderEblEntries([idOnlyEntry])
    await waitForSpinnerToBeRemoved(screen)
    const article = screen.getByRole('article', { name: 'SI₄' })
    expect(
      within(article).getByRole('heading', { level: 3 }),
    ).toHaveTextContent('SI₄')
    const navMenu = screen.getByRole('navigation', { name: 'On this page' })
    expect(within(navMenu).getByRole('link', { name: 'SI₄' })).toHaveAttribute(
      'href',
      '#ebl-realia-1',
    )
  })

  it('numbers an entry without any label', async () => {
    renderEblEntries([{ ...idOnlyEntry, id: '' }])
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.getByRole('article', { name: 'Entry 1' })).toBeInTheDocument()
    const navMenu = screen.getByRole('navigation', { name: 'On this page' })
    expect(
      within(navMenu).getByRole('link', { name: 'Entry 1' }),
    ).toBeInTheDocument()
  })

  it('leaves out fields without a value', async () => {
    renderEblEntries([{ ...idOnlyEntry, translation: 'Lisi' }])
    await waitForSpinnerToBeRemoved(screen)
    const article = screen.getByRole('article', { name: 'Lisi' })
    expect(fieldLabels(article)).toEqual(['Translation'])
  })

  it('omits the field list when no field has a value', async () => {
    renderEblEntries([idOnlyEntry])
    await waitForSpinnerToBeRemoved(screen)
    const article = screen.getByRole('article', { name: 'SI₄' })
    expect(fieldLabels(article)).toEqual([])
  })

  it('shows an unknown part of speech code as it is', async () => {
    renderEblEntries([eblRealiaEntryFactory.build({ pos: 'XYZ' })])
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.getByText('XYZ')).toBeInTheDocument()
  })

  it('numbers several Wikidata links without showing their IDs', async () => {
    renderEblEntries([
      eblRealiaEntryFactory.build({ wikidataId: ['Q1', 'Q2'] }),
    ])
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.getByRole('link', { name: 'Wikidata 1' })).toHaveAttribute(
      'href',
      'https://www.wikidata.org/wiki/Q1',
    )
    expect(screen.getByRole('link', { name: 'Wikidata 2' })).toHaveAttribute(
      'href',
      'https://www.wikidata.org/wiki/Q2',
    )
    expect(screen.queryByText(/Q1|Q2/)).not.toBeInTheDocument()
  })
})
