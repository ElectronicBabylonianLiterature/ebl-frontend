import { renderHook } from '@testing-library/react'
import { asLibreMap, createMapMock } from 'test-support/maplibre-map-helpers'
import { resetMapLibreMock } from '__mocks__/maplibre-gl'
import useMapPanelPadding from './useMapPanelPadding'
import { NO_PANEL_PADDING, panelPadding } from './mapPanelPadding'

beforeEach(() => resetMapLibreMock())

describe('useMapPanelPadding', () => {
  it('applies no padding while closed', () => {
    const mapMock = createMapMock()
    const mapRef = { current: asLibreMap(mapMock) }

    renderHook(() => useMapPanelPadding(mapRef, false, 'right', 360))

    expect(mapMock.setPadding).not.toHaveBeenCalled()
  })

  it('reserves the drawer side once opened', () => {
    const mapMock = createMapMock()
    const mapRef = { current: asLibreMap(mapMock) }

    renderHook(() => useMapPanelPadding(mapRef, true, 'right', 360))

    expect(mapMock.setPadding).toHaveBeenCalledWith(panelPadding('right', 360))
  })

  it('resets padding when the panel closes', () => {
    const mapMock = createMapMock()
    const mapRef = { current: asLibreMap(mapMock) }

    const { rerender } = renderHook(
      ({ isOpen }) => useMapPanelPadding(mapRef, isOpen, 'right', 360),
      { initialProps: { isOpen: true } },
    )
    rerender({ isOpen: false })

    expect(mapMock.setPadding).toHaveBeenLastCalledWith(NO_PANEL_PADDING)
  })

  it('does not reapply identical padding on an unrelated rerender', () => {
    const mapMock = createMapMock()
    const mapRef = { current: asLibreMap(mapMock) }

    const { rerender } = renderHook(
      ({ sizePx }) => useMapPanelPadding(mapRef, true, 'right', sizePx),
      { initialProps: { sizePx: 360 } },
    )
    rerender({ sizePx: 360 })

    expect(mapMock.setPadding).toHaveBeenCalledTimes(1)
  })

  it('reapplies when the reserved size changes', () => {
    const mapMock = createMapMock()
    const mapRef = { current: asLibreMap(mapMock) }

    const { rerender } = renderHook(
      ({ sizePx }) => useMapPanelPadding(mapRef, true, 'bottom', sizePx),
      { initialProps: { sizePx: 200 } },
    )
    rerender({ sizePx: 320 })

    expect(mapMock.setPadding).toHaveBeenLastCalledWith(
      panelPadding('bottom', 320),
    )
  })

  it('does nothing when the map is not yet created', () => {
    const mapRef = { current: null }

    expect(() =>
      renderHook(() => useMapPanelPadding(mapRef, true, 'right', 360)),
    ).not.toThrow()
  })
})
