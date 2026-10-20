import { act, renderHook } from '@testing-library/react'
import { Map as MapLibreMap } from 'maplibre-gl'
import useExcavationAreas from 'map/useExcavationAreas'
import {
  clearMockStyleResources,
  mockAddLayer,
  mockAddSource,
  mockOff,
  mockOn,
  mockSetLayoutProperty,
  resetMapMocks,
  triggerMapEvent,
} from 'map/mapLibreMock.testSupport'

jest.mock('maplibre-gl')

beforeEach(resetMapMocks)

it('ignores stale style events after the map owner replaces its instance', () => {
  const mapRef: { current: MapLibreMap | null } = {
    current: new MapLibreMap({ container: document.createElement('div') }),
  }
  const { unmount } = renderHook(() =>
    useExcavationAreas(mapRef, {
      isVisible: true,
      selectedPolygonId: null,
      onSelectPolygon: jest.fn(),
    }),
  )
  clearMockStyleResources()
  mockAddLayer.mockClear()
  mockAddSource.mockClear()
  mockSetLayoutProperty.mockClear()
  mapRef.current = null

  act(() => triggerMapEvent('style.load'))

  expect(mockAddSource).not.toHaveBeenCalled()
  expect(mockAddLayer).not.toHaveBeenCalled()
  expect(mockSetLayoutProperty).not.toHaveBeenCalled()
  unmount()
  expect(mockOff).toHaveBeenCalledWith('style.load', expect.any(Function))
  expect(mockOff).toHaveBeenCalledWith('sourcedata', expect.any(Function))
})

it('ignores callbacks captured before the hook unmounts', () => {
  const mapRef: { current: MapLibreMap | null } = {
    current: new MapLibreMap({ container: document.createElement('div') }),
  }
  const { unmount } = renderHook(() =>
    useExcavationAreas(mapRef, {
      isVisible: true,
      selectedPolygonId: null,
      onSelectPolygon: jest.fn(),
    }),
  )
  const callbacks = mockOn.mock.calls
    .filter(([event]) => event === 'style.load')
    .map(([, callback]) => callback)
  unmount()
  mockAddLayer.mockClear()
  mockAddSource.mockClear()
  mockSetLayoutProperty.mockClear()

  act(() => callbacks.forEach((callback) => callback()))

  expect(mockAddSource).not.toHaveBeenCalled()
  expect(mockAddLayer).not.toHaveBeenCalled()
  expect(mockSetLayoutProperty).not.toHaveBeenCalled()
})
