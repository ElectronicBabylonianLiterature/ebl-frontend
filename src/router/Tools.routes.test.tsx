import { screen } from '@testing-library/react'
import {
  getCurrentTab,
  getDisplayTitle,
  getToolsBreadcrumbs,
} from 'router/toolsConfig'
import {
  renderTools,
  rerenderTools,
  type ToolsActiveTab,
} from 'router/Tools.testSupport'
import { expectToolsContentPagesMocked } from 'router/Tools.contentMocks.testSupport'
import { setReducedMotionMatchMedia } from 'test-support/matchMedia'

describe('Tools routes', () => {
  it('stubs every tools content page', expectToolsContentPagesMocked)

  it('syncs selected tab when activeTab prop changes', () => {
    const { rerender } = renderTools('signs')

    expect(screen.getByText('Signs Mock')).toBeInTheDocument()

    rerenderTools(rerender, 'dictionary')

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
    expect(getDisplayTitle('unknown-tab' as ToolsActiveTab)).toEqual('Tools')
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
