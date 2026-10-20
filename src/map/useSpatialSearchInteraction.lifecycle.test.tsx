import { renderHook } from '@testing-library/react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import useSpatialSearchInteraction from 'map/useSpatialSearchInteraction'
import {
  mockMapInstance,
  mockOn,
  mockOff,
  resetMapMocks,
  triggerMapEvent,
} from 'map/mapLibreMock.testSupport'
import { asLibreMap } from 'test-support/maplibre-map-helpers'

jest.mock('maplibre-gl')

beforeEach(resetMapMocks)

function createMap(): MapLibreMap {
  return asLibreMap({
    ...mockMapInstance,
    resize: jest.fn(),
    setTerrain: jest.fn(),
  })
}

function drawingOptions(): Parameters<typeof useSpatialSearchInteraction>[1] {
  return {
    isActive: true,
    refs: {
      isActive: { current: true },
      isDrawing: { current: true },
      drawStart: { current: null },
      shape: { current: null },
    },
    drawStart: null,
    shape: null,
    addCorner: jest.fn(),
    clear: jest.fn(),
  }
}

it('ignores clicks and Escape from a replaced map', () => {
  const mapRef = { current: createMap() }
  const options = drawingOptions()
  renderHook(() => useSpatialSearchInteraction(mapRef, options))
  mapRef.current = createMap()

  triggerMapEvent('click', {
    point: { x: 0, y: 0 },
    lngLat: { lng: 43, lat: 35 },
  })
  const escape = new KeyboardEvent('keydown', {
    key: 'Escape',
    cancelable: true,
  })
  window.dispatchEvent(escape)

  expect(options.addCorner).not.toHaveBeenCalled()
  expect(options.clear).not.toHaveBeenCalled()
  expect(escape.defaultPrevented).toBe(false)
})

it('keeps disposed callbacks inactive when the old map reference is reused', () => {
  const map = createMap()
  const mapRef = { current: map }
  const options = drawingOptions()
  const { unmount } = renderHook(() =>
    useSpatialSearchInteraction(mapRef, options),
  )
  const handleClick = mockOn.mock.calls.find(
    ([event]) => event === 'click',
  )?.[1]
  mapRef.current = createMap()
  unmount()
  mapRef.current = map

  expect(mockOff).toHaveBeenCalledWith('click', handleClick)
  handleClick({
    point: { x: 0, y: 0 },
    lngLat: { lng: 43, lat: 35 },
  })

  expect(options.addCorner).not.toHaveBeenCalled()
})
