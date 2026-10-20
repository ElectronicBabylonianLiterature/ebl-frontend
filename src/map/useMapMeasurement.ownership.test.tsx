import { act, renderHook } from '@testing-library/react'
import {
  deferMapLoad,
  mockAddSource,
  mockOff,
  mockOnce,
  resetMapMocks,
  triggerMapEvent,
} from 'map/mapLibreMock.testSupport'
import useMapMeasurement from 'map/useMapMeasurement'
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl'

jest.mock('maplibre-gl')

beforeEach(resetMapMocks)

it('ignores map clicks, delayed loads and shortcuts after losing map ownership', () => {
  deferMapLoad()
  const mapRef: { current: MapLibreMap | null } = {
    current: new maplibregl.Map({ container: document.createElement('div') }),
  }
  const { result } = renderHook(() => useMapMeasurement(mapRef, true))
  act(() => result.current.addPointAtCenter())
  mapRef.current = null
  const escape = new KeyboardEvent('keydown', {
    key: 'Escape',
    cancelable: true,
  })

  act(() => {
    triggerMapEvent('load')
    triggerMapEvent('click', {
      point: { x: 0, y: 0 },
      lngLat: { lng: 43, lat: 35 },
    })
    window.dispatchEvent(escape)
  })

  expect(mockAddSource).not.toHaveBeenCalled()
  expect(result.current.pointCount).toBe(1)
  expect(escape.defaultPrevented).toBe(false)
})

it('does not install layers after disposal if the original map is reused', () => {
  deferMapLoad()
  const map = new maplibregl.Map({ container: document.createElement('div') })
  const mapRef: { current: MapLibreMap | null } = { current: map }
  const { unmount } = renderHook(() => useMapMeasurement(mapRef, true))
  const callbacks = mockOnce.mock.calls.map(([, callback]) => callback)
  mapRef.current = null
  unmount()
  mapRef.current = map

  act(() => callbacks.forEach((callback) => callback()))

  expect(mockOff).toHaveBeenCalledWith('load', expect.any(Function))
  expect(mockOff).toHaveBeenCalledWith('click', expect.any(Function))
  expect(mockAddSource).not.toHaveBeenCalled()
})
