import { act, renderHook } from '@testing-library/react'
import { Map as MapLibreMap } from 'maplibre-gl'
import useExcavationAreas from 'map/useExcavationAreas'
import {
  EXCAVATION_AREA_LAYER_IDS,
  EXCAVATION_AREA_SELECTED_LAYER_ID,
} from 'map/mapExcavationLayers'
import {
  clearMockStyleResources,
  mockAddLayer,
  mockAddSource,
  markLayersAdded,
  mockGetSource,
  mockOff,
  mockOn,
  mockSetLayoutProperty,
  resetMapMocks,
  triggerMapEvent,
} from 'map/mapLibreMock.testSupport'

jest.mock('maplibre-gl')

const POLYGON_INDEX = new Map()

beforeEach(resetMapMocks)

it('ignores stale style events after the map owner replaces its instance', () => {
  const mapRef: { current: MapLibreMap | null } = {
    current: new MapLibreMap({ container: document.createElement('div') }),
  }
  const { unmount } = renderHook(() =>
    useExcavationAreas(mapRef, {
      isVisible: true,
      onAvailabilityChange: undefined,
      selectedPolygonId: null,
      onSelectPolygon: jest.fn(),
      polygonIndex: POLYGON_INDEX,
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
      onAvailabilityChange: undefined,
      selectedPolygonId: null,
      onSelectPolygon: jest.fn(),
      polygonIndex: POLYGON_INDEX,
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

it('waits for a map owner before registering listeners', () => {
  renderHook(() =>
    useExcavationAreas(
      { current: null },
      {
        isVisible: true,
        selectedPolygonId: null,
        onSelectPolygon: jest.fn(),
        polygonIndex: POLYGON_INDEX,
      },
    ),
  )

  expect(mockOn).not.toHaveBeenCalled()
  expect(mockAddSource).not.toHaveBeenCalled()
})

it('reuses source and layers already installed when the style event repeats', () => {
  const mapRef = {
    current: new MapLibreMap({ container: document.createElement('div') }),
  }
  markLayersAdded(
    ...EXCAVATION_AREA_LAYER_IDS,
    EXCAVATION_AREA_SELECTED_LAYER_ID,
  )
  mockGetSource.mockReturnValue({})
  renderHook(() =>
    useExcavationAreas(mapRef, {
      isVisible: false,
      onAvailabilityChange: undefined,
      selectedPolygonId: null,
      onSelectPolygon: jest.fn(),
      polygonIndex: POLYGON_INDEX,
    }),
  )
  act(() => triggerMapEvent('style.load'))

  expect(mockAddSource).not.toHaveBeenCalled()
  expect(mockAddLayer).not.toHaveBeenCalled()
  expect(mockSetLayoutProperty).toHaveBeenCalledWith(
    EXCAVATION_AREA_LAYER_IDS[0],
    'visibility',
    'none',
  )
})
