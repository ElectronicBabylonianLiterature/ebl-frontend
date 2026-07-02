import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Tools from 'router/Tools'
import MemorySession, { guestSession } from 'auth/Session'
import { renderTools } from 'router/Tools.testSupport'

jest.mock('router/compat', () => ({
  ...jest.requireActual('router/compat'),
  useHistory: () => ({ push: jest.fn() }),
}))

jest.mock('signs/ui/search/Signs', () => ({
  __esModule: true,
  default: () => <div>Signs Mock</div>,
}))

jest.mock('dictionary/ui/search/Dictionary', () => ({
  __esModule: true,
  default: () => <div>Dictionary Mock</div>,
}))

jest.mock('bibliography/ui/BibliographyReferencesContent', () => ({
  __esModule: true,
  default: () => <div>Bibliography References Mock</div>,
}))

jest.mock('afo-register/ui/AfoRegisterSearchPage', () => ({
  __esModule: true,
  default: () => <div>AfO-Register Mock</div>,
}))

jest.mock('realia/ui/RealiaSearchPage', () => ({
  __esModule: true,
  default: () => <div>Realia Mock</div>,
}))

jest.mock('dossiers/ui/DossiersSearchPage', () => ({
  __esModule: true,
  default: () => <div>Dossiers Mock</div>,
}))

jest.mock('fragmentarium/ui/GenresPage', () => ({
  __esModule: true,
  default: () => <div>Genres Mock</div>,
}))

jest.mock('chronology/ui/DateConverter/DateConverterForm', () => ({
  __esModule: true,
  default: () => <div>Date Converter Form Mock</div>,
  AboutDateConverter: () => <div>About Date Converter Mock</div>,
}))

jest.mock('chronology/ui/Kings/BrinkmanKingsTable', () => ({
  __esModule: true,
  default: () => <div>Kings Mock</div>,
}))

jest.mock('signs/ui/CuneiformConverter/CuneiformConverterForm', () => ({
  __esModule: true,
  default: () => <div>Cuneiform Converter Mock</div>,
}))

describe('Tools', () => {
  it('renders tools introduction when no tab is selected', () => {
    renderTools()
    expect(screen.getByText('Welcome to eBL Tools')).toBeInTheDocument()
  })

  it('renders signs content', () => {
    renderTools('signs')
    expect(screen.getByText('Signs Mock')).toBeInTheDocument()
  })

  it('renders references content', () => {
    renderTools('references')
    expect(screen.getByText('Bibliography References Mock')).toBeInTheDocument()
  })

  it('renders afo-register content', () => {
    renderTools('afo-register')
    expect(screen.getByText('AfO-Register Mock')).toBeInTheDocument()
  })

  it('renders realia content', () => {
    renderTools('realia')
    expect(screen.getByText('Realia Mock')).toBeInTheDocument()
  })

  it('shows the Realia nav item when the session has the readRealia scope', () => {
    renderTools(undefined, new MemorySession(['read:realia']))
    expect(screen.getByRole('link', { name: 'Realia' })).toBeInTheDocument()
  })

  it('hides the Realia nav item when the session lacks the readRealia scope', () => {
    renderTools(undefined, guestSession)
    expect(
      screen.queryByRole('link', { name: 'Realia' }),
    ).not.toBeInTheDocument()
  })

  it('renders dossiers content', () => {
    renderTools('dossiers')
    expect(screen.getByText('Dossiers Mock')).toBeInTheDocument()
  })

  it('renders genres content', () => {
    renderTools('genres')
    expect(screen.getByText('Genres Mock')).toBeInTheDocument()
  })

  it('renders date converter content', () => {
    renderTools('date-converter')
    expect(screen.getByText('About Date Converter Mock')).toBeInTheDocument()
    expect(screen.getByText('Date Converter Form Mock')).toBeInTheDocument()
  })

  it('renders kings content', () => {
    renderTools('list-of-kings')
    expect(screen.getByText('Kings Mock')).toBeInTheDocument()
  })

  it('renders cuneiform converter content', () => {
    renderTools('cuneiform-converter')
    expect(screen.getByText('Cuneiform Converter Mock')).toBeInTheDocument()
  })

  it('renders introduction for unknown activeTab', () => {
    renderTools('unknown-tab' as Parameters<typeof Tools>[0]['activeTab'])
    expect(screen.getByText('Welcome to eBL Tools')).toBeInTheDocument()
  })

  it('updates selected tab when nav item is clicked', async () => {
    renderTools()
    const dictionaryLink = screen.getByRole('link', {
      name: /Akkadian Dictionary/,
    })

    await userEvent.click(dictionaryLink)

    expect(dictionaryLink).toHaveAttribute('href', '/tools/dictionary')
    expect(screen.getByText('Dictionary Mock')).toBeInTheDocument()
  })

  it('keeps current tab active when clicking the already active tab', async () => {
    renderTools('dictionary')
    const dictionaryLink = screen.getByRole('link', {
      name: /Akkadian Dictionary/,
    })

    await userEvent.click(dictionaryLink)

    expect(dictionaryLink).toHaveClass('active')
    expect(screen.getByText('Dictionary Mock')).toBeInTheDocument()
  })

  it('renders nav links to tools routes', () => {
    renderTools('dictionary')

    expect(
      screen.getByRole('link', { name: /Akkadian Dictionary/ }),
    ).toHaveAttribute('href', '/tools/dictionary')
    expect(screen.getByRole('link', { name: /References/ })).toHaveAttribute(
      'href',
      '/tools/references',
    )
  })

  it('renders nav links in the requested order', () => {
    renderTools()

    const sidebarTitles = screen
      .getAllByRole('link')
      .filter((link) => link.classList.contains('tools-nav__item'))
      .map((link) => link.textContent)

    expect(sidebarTitles).toEqual([
      '𒀀Signs',
      'ꞋAkkadian Dictionary',
      '⚘Realia',
      '⇌Date Converter',
      '♔List of Kings',
      '⊕Genres',
      '⊟Dossiers',
      '※References',
      '⊞AfO-Register',
      '𒐕Cuneiform Converter',
    ])
  })

  it('marks decorative icons as hidden from assistive technologies', () => {
    renderTools('dictionary')

    const navIcons = ['𒀀', 'Ꞌ', '⚘', '⇌', '♔', '⊕', '⊟', '※', '⊞', '𒐕']

    navIcons.forEach((icon) => {
      expect(
        screen.getByText(icon, { selector: '.tools-nav__icon' }),
      ).toHaveAttribute('aria-hidden', 'true')
    })

    expect(
      screen.getByText('Ꞌ', { selector: '.tools-content__icon' }),
    ).toHaveAttribute('aria-hidden', 'true')
  })
})
