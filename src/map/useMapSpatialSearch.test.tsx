import React, { useRef } from 'react'
import { act, render, renderHook } from '@testing-library/react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import type { ExcavationPolygonIndex } from 'map/excavationPolygonIndex'
import {
  deferMapLoad,
  mockAddLayer,
  mockAddSource,
  mockGetBounds,
  mockGetCenter,
  mockGetSource,
  mockMapInstance,
  mockSetData,
  resetMapMocks,
  triggerMapEvent,
} from 'map/mapLibreMock.testSupport'
import type { FragmentMapDataState } from 'map/useFragmentMapData'
import useMapSpatialSearch from 'map/useMapSpatialSearch'
import type { SpatialSearchController } from 'map/useMapSpatialSearch'
import { asLibreMap } from 'test-support/maplibre-map-helpers'
import {
  rejectDisposedMapAccess,
  useDisposingMockMap,
} from 'map/mapLibreDisposedMock.testSupport'

jest.mock('maplibre-gl')

const EMPTY_INDEX: ExcavationPolygonIndex = new Map()
const EMPTY_DATA: FragmentMapDataState = {
  sites: new Map(),
  findspots: [],
  polygonSummaries: new Map(),
}

function useHarness(isActive: boolean): SpatialSearchController {
  const mapRef = useRef<MapLibreMap | null>(asLibreMap(mockMapInstance))
  return useMapSpatialSearch(mapRef, isActive, EMPTY_INDEX, EMPTY_DATA)
}

function OwnerTeardownHarness(): null {
  const mapRef = useDisposingMockMap()
  useMapSpatialSearch(mapRef, true, EMPTY_INDEX, EMPTY_DATA)
  return null
}

describe('useMapSpatialSearch', () => {
  beforeEach(resetMapMocks)

  it('installs its layers and searches canonical viewport bounds', () => {
    const { result } = renderHook(() => useHarness(true))

    act(() => result.current.searchViewport())

    expect(mockAddSource).toHaveBeenCalledWith(
      'ebl-spatial-search',
      expect.any(Object),
    )
    expect(mockAddLayer).toHaveBeenCalledTimes(3)
    expect(result.current.shape).toEqual({
      type: 'viewport',
      bounds: [[43, 35, 44, 36]],
    })
  })

  it('draws two corners and renders the latest geometry', () => {
    mockGetSource.mockReturnValue({ setData: mockSetData })
    const { result } = renderHook(() => useHarness(true))

    act(() => result.current.startDrawing())
    act(() => {
      triggerMapEvent('click', {
        point: { x: 1, y: 2 },
        lngLat: { lng: 43, lat: 35 },
      })
    })
    expect(result.current.cornerCount).toBe(1)
    expect(mockSetData).toHaveBeenLastCalledWith(
      expect.objectContaining({
        features: [
          expect.objectContaining({
            geometry: { type: 'Point', coordinates: [43, 35] },
          }),
        ],
      }),
    )

    act(() => {
      triggerMapEvent('click', {
        point: { x: 3, y: 4 },
        lngLat: { lng: 44, lat: 36 },
      })
    })
    expect(result.current.isDrawing).toBe(false)
    expect(result.current.shape).toEqual({
      type: 'bounding-box',
      bounds: [[43, 35, 44, 36]],
    })
  })

  it('offers map-center corners and keeps drawing after a zero-area corner', () => {
    mockGetCenter
      .mockReturnValueOnce({ lng: 43, lat: 35 })
      .mockReturnValueOnce({ lng: 43, lat: 35 })
      .mockReturnValueOnce({ lng: 44, lat: 36 })
    const { result } = renderHook(() => useHarness(true))

    act(() => result.current.startDrawing())
    act(() => result.current.addCornerAtCenter())
    act(() => result.current.addCornerAtCenter())
    expect(result.current.isDrawing).toBe(true)
    expect(result.current.cornerCount).toBe(1)
    expect(result.current.validationMessage).toBe(
      'Choose a second corner with a different latitude and longitude.',
    )

    act(() => result.current.addCornerAtCenter())
    expect(result.current.shape).toEqual({
      type: 'bounding-box',
      bounds: [[43, 35, 44, 36]],
    })
  })

  it('cancels drawing with Escape but ignores editable controls', () => {
    const { result } = renderHook(() => useHarness(true))
    act(() => result.current.startDrawing())
    const input = document.createElement('input')
    document.body.append(input)

    act(() => {
      input.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          cancelable: true,
        }),
      )
    })
    expect(result.current.isDrawing).toBe(true)

    const escape = new KeyboardEvent('keydown', {
      key: 'Escape',
      cancelable: true,
    })
    act(() => window.dispatchEvent(escape))
    expect(escape.defaultPrevented).toBe(true)
    expect(result.current.isDrawing).toBe(false)
    input.remove()
  })

  it('searching the viewport cancels a pending rectangle', () => {
    const { result } = renderHook(() => useHarness(true))
    act(() => result.current.startDrawing())
    act(() => {
      triggerMapEvent('click', {
        point: { x: 1, y: 2 },
        lngLat: { lng: 43, lat: 35 },
      })
    })

    act(() => result.current.searchViewport())

    expect(result.current.isDrawing).toBe(false)
    expect(result.current.cornerCount).toBe(0)
    expect(result.current.shape?.type).toBe('viewport')
  })

  it('replays the latest corner when a delayed style loads', () => {
    deferMapLoad()
    let sourceReady = false
    mockAddSource.mockImplementation(() => {
      sourceReady = true
    })
    mockGetSource.mockImplementation(() =>
      sourceReady ? { setData: mockSetData } : undefined,
    )
    const { result } = renderHook(() => useHarness(true))
    act(() => result.current.startDrawing())
    act(() => {
      triggerMapEvent('click', {
        point: { x: 1, y: 2 },
        lngLat: { lng: 43, lat: 35 },
      })
    })

    act(() => triggerMapEvent('style.load'))

    expect(mockSetData).toHaveBeenLastCalledWith(
      expect.objectContaining({ features: [expect.any(Object)] }),
    )
  })

  it('clears on deactivation and avoids a disposed owner map', () => {
    const { result, rerender } = renderHook(
      ({ active }) => useHarness(active),
      { initialProps: { active: true } },
    )
    act(() => result.current.startDrawing())
    rerender({ active: false })
    expect(result.current.isDrawing).toBe(false)

    rejectDisposedMapAccess()
    const { unmount } = render(<OwnerTeardownHarness />)
    expect(unmount).not.toThrow()
  })

  it('fails closed for invalid viewport coordinates', () => {
    mockGetBounds.mockReturnValue({
      getWest: () => Number.NaN,
      getSouth: () => 35,
      getEast: () => 44,
      getNorth: () => 36,
    })
    const { result } = renderHook(() => useHarness(true))

    act(() => result.current.searchViewport())

    expect(result.current.shape).toBeNull()
  })
})
