import React from 'react'
import { render, screen } from '@testing-library/react'
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
import RealiaService from 'realia/application/RealiaService'
import FragmentService from 'fragmentarium/application/FragmentService'
import DossiersService from 'dossiers/application/DossiersService'
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

describe('Tools routes', () => {
  it('syncs selected tab when activeTab prop changes', () => {
    const props = {
      markupService: {} as MarkupService,
      signService: {} as SignService,
      wordService: {} as WordService,
      bibliographyService: {} as BibliographyService,
      afoRegisterService: {} as AfoRegisterService,
      realiaService: {} as RealiaService,
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
          realiaService={{} as RealiaService}
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
          realiaService={{} as RealiaService}
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
      render(
        <MemoryRouter initialEntries={['/tools#target-section']}>
          <Tools
            markupService={{} as MarkupService}
            signService={{} as SignService}
            wordService={{} as WordService}
            bibliographyService={{} as BibliographyService}
            afoRegisterService={{} as AfoRegisterService}
            realiaService={{} as RealiaService}
            dossiersService={{} as DossiersService}
            fragmentService={{} as FragmentService}
          />
        </MemoryRouter>,
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
