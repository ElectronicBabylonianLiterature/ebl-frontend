import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'
import {
  eblRealiaEntryFactory,
  realiaEntryFactory,
} from 'test-support/realia-fixtures'
import { installMockIntersectionObserver } from 'test-support/intersectionObserverMock'
import { renderDisplay } from 'realia/ui/RealiaDisplay.testSupport'

jest.mock('realia/application/RealiaService')

const entry = realiaEntryFactory.build({
  id: 'Lisi(n)',
  reallexikon: [],
  afoRegister: [],
  referenceType: ['eBL'],
  eblRealia: [
    eblRealiaEntryFactory.build({ transliteration: 'SI₄' }),
    eblRealiaEntryFactory.build({ transliteration: 'MÚL KUR' }),
  ],
})

function navMenu(): HTMLElement {
  return screen.getByRole('navigation', { name: 'On this page' })
}

function menuToggle(): HTMLElement {
  return within(navMenu()).getByRole('button', { name: 'On this page' })
}

describe('RealiaDisplay navigation focus and mobile menu', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    installMockIntersectionObserver()
  })

  it('moves keyboard focus to the entry chosen in the menu', async () => {
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    fireEvent.click(within(navMenu()).getByRole('link', { name: 'MÚL KUR' }))
    const article = screen.getByRole('article', { name: 'MÚL KUR' })
    await waitFor(() => expect(article).toHaveFocus())
    expect(article).toHaveAttribute('tabindex', '-1')
  })

  it('places the headword before the menu', async () => {
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    const headword = screen.getByRole('heading', { level: 1, name: 'Lisi(n)' })
    expect(
      headword.compareDocumentPosition(navMenu()) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('folds and unfolds the menu with its toggle', async () => {
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(menuToggle()).toHaveAttribute('aria-expanded', 'false')
    expect(menuToggle()).toHaveAttribute('aria-controls', 'realia-top-nav-body')
    fireEvent.click(menuToggle())
    expect(menuToggle()).toHaveAttribute('aria-expanded', 'true')
    expect(navMenu()).toHaveClass('is-expanded')
    fireEvent.click(menuToggle())
    expect(menuToggle()).toHaveAttribute('aria-expanded', 'false')
  })

  it('folds the menu after a jump', async () => {
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    fireEvent.click(menuToggle())
    fireEvent.click(within(navMenu()).getByRole('link', { name: 'SI₄' }))
    expect(menuToggle()).toHaveAttribute('aria-expanded', 'false')
  })
})
