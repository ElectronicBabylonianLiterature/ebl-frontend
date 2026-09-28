import React, { useEffect, useRef } from 'react'
import { act, render, renderHook } from '@testing-library/react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import {
  deferMapLoad,
  mockAddLayer,
  mockAddSource,
  mockGetLayer,
  mockGetSource,
  mockMapInstance,
  mockRemove,
  mockSetData,
  resetMapMocks,
  triggerMapEvent,
} from 'map/mapLibreMock.testSupport'
import { MAX_MEASUREMENT_POINTS } from 'map/mapMeasurement'
import useMapMeasurement from 'map/useMapMeasurement'

jest.mock('maplibre-gl')

function useHarness(isActive: boolean) {
  const mapRef = useRef<MapLibreMap | null>(
    mockMapInstance as unknown as MapLibreMap,
  )
  return useMapMeasurement(mapRef, isActive)
}

function OwnerTeardownHarness(): null {
  const mapRef = useRef<MapLibreMap | null>(
    mockMapInstance as unknown as MapLibreMap,
  )
  useEffect(
    () => () => {
      mockRemove()
      mapRef.current = null
    },
    [],
  )
  useMapMeasurement(mapRef, true)
  return null
}

describe('useMapMeasurement', () => {
  beforeEach(resetMapMocks)

  it('installs its source and both layers', () => {
    renderHook(() => useHarness(true))

    expect(mockAddSource).toHaveBeenCalledWith(
      'ebl-measurement',
      expect.any(Object),
    )
    expect(mockAddLayer).toHaveBeenCalledTimes(2)
  })

  it('adds clicked positions and exposes a center-point keyboard alternative', () => {
    mockGetSource.mockReturnValue({ setData: mockSetData })
    const { result } = renderHook(() => useHarness(true))

    act(() => {
      triggerMapEvent('click', {
        point: { x: 10, y: 20 },
        lngLat: { lng: 44, lat: 33 },
      })
      result.current.addPointAtCenter()
    })

    expect(result.current.pointCount).toBe(2)
    expect(mockSetData).toHaveBeenLastCalledWith(
      expect.objectContaining({
        features: expect.arrayContaining([
          expect.objectContaining({
            geometry: { type: 'Point', coordinates: [44, 33] },
          }),
          expect.objectContaining({
            geometry: { type: 'Point', coordinates: [43.25, 35.45] },
          }),
        ]),
      }),
    )
  })

  it('renders the latest points when a delayed style becomes ready', () => {
    deferMapLoad()
    let sourceReady = false
    mockAddSource.mockImplementation(() => {
      sourceReady = true
    })
    mockGetSource.mockImplementation(() =>
      sourceReady ? { setData: mockSetData } : undefined,
    )
    const { result } = renderHook(() => useHarness(true))

    act(() => {
      triggerMapEvent('click', {
        point: { x: 1, y: 2 },
        lngLat: { lng: 43, lat: 35 },
      })
    })
    expect(result.current.pointCount).toBe(1)

    act(() => triggerMapEvent('load'))

    expect(mockSetData).toHaveBeenLastCalledWith(
      expect.objectContaining({ features: [expect.any(Object)] }),
    )
  })

  it('ignores measurement shortcuts in editable controls', () => {
    const { result } = renderHook(() => useHarness(true))
    act(() => result.current.addPointAtCenter())
    const input = document.createElement('input')
    document.body.append(input)

    act(() => {
      input.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Backspace',
          bubbles: true,
          cancelable: true,
        }),
      )
    })

    expect(result.current.pointCount).toBe(1)
    input.remove()
  })

  it('consumes Backspace and Escape only when a point can change', () => {
    const { result } = renderHook(() => useHarness(true))
    act(() => result.current.addPointAtCenter())
    const backspace = new KeyboardEvent('keydown', {
      key: 'Backspace',
      cancelable: true,
    })

    act(() => window.dispatchEvent(backspace))

    expect(backspace.defaultPrevented).toBe(true)
    expect(result.current.pointCount).toBe(0)
    const escape = new KeyboardEvent('keydown', {
      key: 'Escape',
      cancelable: true,
    })
    act(() => window.dispatchEvent(escape))
    expect(escape.defaultPrevented).toBe(false)
  })

  it('caps points and accepts another after undo', () => {
    const { result } = renderHook(() => useHarness(true))

    act(() => {
      for (let index = 0; index <= MAX_MEASUREMENT_POINTS; index += 1) {
        triggerMapEvent('click', {
          point: { x: index, y: index },
          lngLat: { lng: index, lat: 0 },
        })
      }
    })

    expect(result.current.pointCount).toBe(MAX_MEASUREMENT_POINTS)
    expect(result.current.isAtPointLimit).toBe(true)
    act(() => result.current.removeLastPoint())
    expect(result.current.isAtPointLimit).toBe(false)
    act(() => result.current.addPointAtCenter())
    expect(result.current.pointCount).toBe(MAX_MEASUREMENT_POINTS)
  })

  it('clears the temporary measurement when deactivated', () => {
    const { result, rerender } = renderHook(
      ({ active }) => useHarness(active),
      { initialProps: { active: true } },
    )
    act(() => result.current.addPointAtCenter())

    rerender({ active: false })

    expect(result.current.pointCount).toBe(0)
  })

  it('does not touch a map after its owner disposes it', () => {
    let isRemoved = false
    mockRemove.mockImplementation(() => {
      isRemoved = true
    })
    mockGetLayer.mockImplementation(() => {
      if (isRemoved) throw new Error('map style has been removed')
      return undefined
    })
    mockGetSource.mockImplementation(() => {
      if (isRemoved) throw new Error('map style has been removed')
      return undefined
    })

    const { unmount } = render(<OwnerTeardownHarness />)

    expect(unmount).not.toThrow()
    expect(mockRemove).toHaveBeenCalled()
  })
})
