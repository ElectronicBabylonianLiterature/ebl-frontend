import React from 'react'
import { screen } from '@testing-library/react'
import Tools, {
  getCurrentTab,
  getDisplayTitle,
  getToolsBreadcrumbs,
} from 'router/Tools'
import { renderTools, toolsServiceProps } from 'router/Tools.testSupport'
import {
  expectToolsContentPagesMocked,
  type ToolsContentMockName,
} from 'router/Tools.contentMocks.testSupport'
import { setReducedMotionMatchMedia } from 'test-support/matchMedia'

jest.mock('router/compat', () => ({
  ...jest.requireActual('router/compat'),
  useHistory: () => ({ push: jest.fn() }),
}))

function mockToolsContent(name: ToolsContentMockName): unknown {
  return jest
    .requireActual('router/Tools.contentMocks.testSupport')
    .toolsContentMock(name)
}

jest.mock('signs/ui/search/Signs', () => mockToolsContent('signs'))
jest.mock('dictionary/ui/search/Dictionary', () =>
  mockToolsContent('dictionary'),
)
jest.mock('bibliography/ui/BibliographyReferencesContent', () =>
  mockToolsContent('references'),
)
jest.mock('afo-register/ui/AfoRegisterSearchPage', () =>
  mockToolsContent('afoRegister'),
)
jest.mock('realia/ui/RealiaSearchPage', () => mockToolsContent('realia'))
jest.mock('dossiers/ui/DossiersSearchPage', () => mockToolsContent('dossiers'))
jest.mock('fragmentarium/ui/GenresPage', () => mockToolsContent('genres'))
jest.mock('chronology/ui/DateConverter/DateConverterForm', () =>
  mockToolsContent('dateConverter'),
)
jest.mock('chronology/ui/Kings/BrinkmanKingsTable', () =>
  mockToolsContent('kings'),
)
jest.mock('signs/ui/CuneiformConverter/CuneiformConverterForm', () =>
  mockToolsContent('cuneiformConverter'),
)
jest.mock('map/MapTab', () => mockToolsContent('map'))

describe('Tools routes', () => {
  it('stubs every tools content page', expectToolsContentPagesMocked)

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

    renderTools(undefined, undefined, '/tools#target-section')

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

    renderTools(undefined, undefined, '/tools#missing-section')

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
      renderTools(undefined, undefined, '/tools#target-section')

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
