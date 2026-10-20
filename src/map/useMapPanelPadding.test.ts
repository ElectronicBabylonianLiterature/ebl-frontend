import { renderHook } from '@testing-library/react'
import { asLibreMap, createMapMock } from 'test-support/maplibre-map-helpers'
import { resetMapLibreMock } from '__mocks__/maplibre-gl'
import useMapPanelPadding from 'map/useMapPanelPadding'
import { NO_PANEL_PADDING, panelPadding } from 'map/mapPanelPadding'
import { runMapFocus } from 'map/mapFocusTransition'
import { focusProvenance } from 'map/mapCamera'
import { provenanceRecord } from 'test-support/map-fixtures'

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

  it('resumes an interrupted target after applying the new drawer padding', () => {
    const mapMock = createMapMock()
    const map = asLibreMap(mapMock)
    jest.spyOn(map, 'isMoving').mockReturnValue(true)
    const targetPadding = panelPadding('bottom', 320)
    const focus = jest.fn(() => mapMock.padding)
    runMapFocus(map, focus)
    mapMock.setPadding.mockImplementation((padding) => {
      mapMock.emit('moveend')
      mapMock.padding = padding
    })

    renderHook(() => useMapPanelPadding({ current: map }, true, 'bottom', 320))

    expect(focus).toHaveBeenCalledTimes(2)
    expect(focus).toHaveNthReturnedWith(1, NO_PANEL_PADDING)
    expect(focus).toHaveNthReturnedWith(2, targetPadding)
  })

  it('does not replay a completed focus when the drawer padding changes', () => {
    const mapMock = createMapMock()
    const map = asLibreMap(mapMock)
    jest.spyOn(map, 'isMoving').mockReturnValue(true)
    const focus = jest.fn()
    runMapFocus(map, focus)
    mapMock.emit('moveend')

    renderHook(() => useMapPanelPadding({ current: map }, true, 'bottom', 320))

    expect(focus).toHaveBeenCalledTimes(1)
    expect(mapMock.setPadding).toHaveBeenCalledWith(panelPadding('bottom', 320))
  })

  it('reframes a synchronous site selection after the closed drawer mounts', () => {
    const mapMock = createMapMock()
    const map = asLibreMap(mapMock)
    mapMock.fitBounds.mockImplementation(() => mapMock.padding)
    focusProvenance(
      map,
      provenanceRecord({
        polygonCoordinates: [
          { longitude: 43.25, latitude: 35.44 },
          { longitude: 43.27, latitude: 35.44 },
          { longitude: 43.27, latitude: 35.46 },
          { longitude: 43.25, latitude: 35.46 },
        ],
      }),
    )
    mapMock.setPadding.mockImplementation((padding) => {
      mapMock.emit('movestart')
      mapMock.padding = padding
      mapMock.emit('moveend')
    })

    renderHook(() => useMapPanelPadding({ current: map }, true, 'bottom', 382))

    expect(mapMock.fitBounds).toHaveBeenCalledTimes(2)
    expect(mapMock.fitBounds).toHaveNthReturnedWith(1, NO_PANEL_PADDING)
    expect(mapMock.fitBounds).toHaveNthReturnedWith(
      2,
      panelPadding('bottom', 382),
    )
  })
})
