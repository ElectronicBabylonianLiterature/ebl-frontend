import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Tools, {
  getCurrentTab,
  getDisplayTitle,
  getToolsBreadcrumbs,
} from 'router/Tools'
import MarkupService from 'markup/application/MarkupService'
import SignService from 'signs/application/SignService'
import WordService from 'dictionary/application/WordService'
import BibliographyService from 'bibliography/application/BibliographyService'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import FragmentService from 'fragmentarium/application/FragmentService'
import DossiersService from 'dossiers/application/DossiersService'

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

function renderTools(activeTab?: Parameters<typeof Tools>[0]['activeTab']) {
  const props = {
    markupService: {} as MarkupService,
    signService: {} as SignService,
    wordService: {} as WordService,
    bibliographyService: {} as BibliographyService,
    afoRegisterService: {} as AfoRegisterService,
    dossiersService: {} as DossiersService,
    fragmentService: {} as FragmentService,
    activeTab,
  }

  render(
    <MemoryRouter>
      <Tools {...props} />
    </MemoryRouter>,
  )
}

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

  it('syncs selected tab when activeTab prop changes', () => {
    const props = {
      markupService: {} as MarkupService,
      signService: {} as SignService,
      wordService: {} as WordService,
      bibliographyService: {} as BibliographyService,
      afoRegisterService: {} as AfoRegisterService,
      dossiersService: {} as DossiersService,
      fragmentService: {} as FragmentService,
      activeTab: 'signs' as Parameters<typeof Tools>[0]['activeTab'],
    }

    const { rerender } = render(
      <MemoryRouter>
        <Tools {...props} />
      </MemoryRouter>,
    )

    expect(screen.getByText('Signs Mock')).toBeInTheDocument()

    rerender(
      <MemoryRouter>
        <Tools {...props} activeTab="dictionary" />
      </MemoryRouter>,
    )

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

    render(
      <MemoryRouter initialEntries={['/tools#target-section']}>
        <Tools
          markupService={{} as MarkupService}
          signService={{} as SignService}
          wordService={{} as WordService}
          bibliographyService={{} as BibliographyService}
          afoRegisterService={{} as AfoRegisterService}
          dossiersService={{} as DossiersService}
          fragmentService={{} as FragmentService}
        />
      </MemoryRouter>,
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

    render(
      <MemoryRouter initialEntries={['/tools#missing-section']}>
        <Tools
          markupService={{} as MarkupService}
          signService={{} as SignService}
          wordService={{} as WordService}
          bibliographyService={{} as BibliographyService}
          afoRegisterService={{} as AfoRegisterService}
          dossiersService={{} as DossiersService}
          fragmentService={{} as FragmentService}
        />
      </MemoryRouter>,
    )

    jest.runAllTimers()
    expect(getElementByIdSpy).toHaveBeenCalledWith('missing-section')

    getElementByIdSpy.mockRestore()
    jest.useRealTimers()
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
  })

  it('builds breadcrumbs for selected and unselected states', () => {
    expect(getToolsBreadcrumbs('Tools')).toHaveLength(1)
    expect(
      getToolsBreadcrumbs('Akkadian Dictionary', 'dictionary'),
    ).toHaveLength(2)
    expect(getToolsBreadcrumbs('Dossiers', 'dossiers')).toHaveLength(2)
    expect(getToolsBreadcrumbs('Genres', 'genres')).toHaveLength(2)
  })
})
