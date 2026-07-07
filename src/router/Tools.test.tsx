import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Tools, {
  getCurrentTab,
  getDisplayTitle,
  getToolsBreadcrumbs,
} from 'router/Tools'
import MemorySession, { guestSession } from 'auth/Session'
import { renderTools, toolsServiceProps } from 'router/Tools.testSupport'
import { setReducedMotionMatchMedia } from 'test-support/matchMedia'

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

jest.mock('map/MapTab', () => ({
  __esModule: true,
  default: () => <div>Map Mock</div>,
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

  it('renders map content', async () => {
    renderTools('map')
    expect(await screen.findByText('Map Mock')).toBeInTheDocument()
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
    expect(screen.getByRole('link', { name: /Findspot Map/ })).toHaveAttribute(
      'href',
      '/tools/map',
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
      '◈Findspot Map',
    ])
  })

  it('marks decorative icons as hidden from assistive technologies', () => {
    renderTools('dictionary')

    const navIcons = ['𒀀', 'Ꞌ', '⚘', '⇌', '♔', '⊕', '⊟', '※', '⊞', '𒐕', '◈']

    navIcons.forEach((icon) => {
      expect(
        screen.getByText(icon, { selector: '.tools-nav__icon' }),
      ).toHaveAttribute('aria-hidden', 'true')
    })

    expect(
      screen.getByText('Ꞌ', { selector: '.tools-content__icon' }),
    ).toHaveAttribute('aria-hidden', 'true')
  })

  it('syncs selected tab when activeTab prop changes', () => {
    const { rerender } = renderTools('signs')

    expect(screen.getByText('Signs Mock')).toBeInTheDocument()

    rerender(<Tools {...toolsServiceProps()} activeTab="dictionary" />)

    expect(screen.getByText('Dictionary Mock')).toBeInTheDocument()
  })

  it('scrolls to element from hash location', () => {
    jest.useFakeTimers()
    const scrollIntoView = jest.fn()
    const getElementByIdSpy = jest
      .spyOn(document, 'getElementById')
      .mockReturnValue({
        scrollIntoView,
      } as unknown as HTMLElement)

    renderTools(
      undefined,
      new MemorySession(['read:realia']),
      '/tools#target-section',
    )

    jest.runAllTimers()
    expect(getElementByIdSpy).toHaveBeenCalledWith('target-section')
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })

    getElementByIdSpy.mockRestore()
    jest.useRealTimers()
  })

  it('does not scroll when hash target element is missing', () => {
    jest.useFakeTimers()
    const getElementByIdSpy = jest
      .spyOn(document, 'getElementById')
      .mockReturnValue(null)

    renderTools(
      undefined,
      new MemorySession(['read:realia']),
      '/tools#missing-section',
    )

    jest.runAllTimers()
    expect(getElementByIdSpy).toHaveBeenCalledWith('missing-section')

    getElementByIdSpy.mockRestore()
    jest.useRealTimers()
  })

  it('uses non-animated hash scrolling when reduced motion is enabled', () => {
    jest.useFakeTimers()
    const restoreMatchMedia = setReducedMotionMatchMedia(true)

    const scrollIntoView = jest.fn()
    const getElementByIdSpy = jest
      .spyOn(document, 'getElementById')
      .mockReturnValue({
        scrollIntoView,
      } as unknown as HTMLElement)

    try {
      renderTools(
        undefined,
        new MemorySession(['read:realia']),
        '/tools#target-section',
      )

      jest.runAllTimers()
      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto' })
    } finally {
      getElementByIdSpy.mockRestore()
      restoreMatchMedia()
      jest.useRealTimers()
    }
  })

  it('resolves tab metadata and fallback display title', () => {
    expect(getCurrentTab('dictionary')?.title).toEqual('Akkadian Dictionary')
    expect(getCurrentTab(undefined)).toBeUndefined()
    expect(getDisplayTitle(undefined)).toEqual('Tools')
    expect(
      getDisplayTitle(
        'unknown-tab' as Parameters<typeof Tools>[0]['activeTab'],
      ),
    ).toEqual('Tools')
    expect(getDisplayTitle('signs')).toEqual('Signs')
    expect(getDisplayTitle('dictionary')).toEqual('Akkadian Dictionary')
    expect(getDisplayTitle('dossiers')).toEqual('Dossiers')
    expect(getDisplayTitle('genres')).toEqual('Genres')
    expect(getDisplayTitle('map')).toEqual('Findspot Map')
  })

  it('builds breadcrumbs for selected and unselected states', () => {
    expect(getToolsBreadcrumbs('Tools')).toHaveLength(1)
    expect(
      getToolsBreadcrumbs('Akkadian Dictionary', 'dictionary'),
    ).toHaveLength(2)
    expect(getToolsBreadcrumbs('Dossiers', 'dossiers')).toHaveLength(2)
    expect(getToolsBreadcrumbs('Genres', 'genres')).toHaveLength(2)
    expect(getToolsBreadcrumbs('Findspot Map', 'map')).toHaveLength(2)
  })
})
