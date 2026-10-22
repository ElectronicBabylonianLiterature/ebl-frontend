import { act, renderHook } from '@testing-library/react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import {
  mockAddSource,
  mockGetCenter,
  mockMapInstance,
  resetMapMocks,
  triggerMapEvent,
} from 'map/mapLibreMock.testSupport'
import useMapMeasurement from 'map/useMapMeasurement'

jest.mock('maplibre-gl')

function mapReference(): { current: MapLibreMap | null } {
  return { current: mockMapInstance as unknown as MapLibreMap }
}

beforeEach(resetMapMocks)

it('retains points when reselecting a mode and clears them when changing mode', () => {
  const mapRef = mapReference()
  const { result } = renderHook(() => useMapMeasurement(mapRef, true))
  act(() => result.current.addPointAtCenter())

  act(() => result.current.setMode('distance'))
  expect(result.current.pointCount).toBe(1)

  act(() => result.current.setMode('area'))
  expect(result.current.mode).toBe('area')
  expect(result.current.pointCount).toBe(0)
})

it('leaves unrelated keys alone and clears existing points with Escape', () => {
  const mapRef = mapReference()
  const { result } = renderHook(() => useMapMeasurement(mapRef, true))
  act(() => result.current.addPointAtCenter())
  const arrow = new KeyboardEvent('keydown', {
    key: 'ArrowLeft',
    cancelable: true,
  })
  act(() => window.dispatchEvent(arrow))
  expect(result.current.pointCount).toBe(1)
  expect(arrow.defaultPrevented).toBe(false)

  const escape = new KeyboardEvent('keydown', {
    key: 'Escape',
    cancelable: true,
  })
  act(() => window.dispatchEvent(escape))
  expect(result.current.pointCount).toBe(0)
  expect(escape.defaultPrevented).toBe(true)
})

it.each([
  [Number.NaN, 35],
  [43, Number.POSITIVE_INFINITY],
])(
  'rejects nonfinite click and center coordinates %s, %s',
  (longitude, latitude) => {
    const mapRef = mapReference()
    const { result } = renderHook(() => useMapMeasurement(mapRef, true))
    mockGetCenter.mockReturnValue({ lng: longitude, lat: latitude })

    act(() => {
      triggerMapEvent('click', {
        point: { x: 1, y: 2 },
        lngLat: { lng: longitude, lat: latitude },
      })
      result.current.addPointAtCenter()
    })

    expect(result.current.pointCount).toBe(0)
  },
)

it('does not add center points while inactive', () => {
  const mapRef = mapReference()
  const { result } = renderHook(() => useMapMeasurement(mapRef, false))

  act(() => result.current.addPointAtCenter())

  expect(result.current.pointCount).toBe(0)
  expect(mockGetCenter).not.toHaveBeenCalled()
})

it('does not install or add center points without a current map', () => {
  const mapRef = { current: null }
  const { result } = renderHook(() => useMapMeasurement(mapRef, true))

  act(() => result.current.addPointAtCenter())

  expect(result.current.pointCount).toBe(0)
  expect(mockGetCenter).not.toHaveBeenCalled()
  expect(mockAddSource).not.toHaveBeenCalled()
})
