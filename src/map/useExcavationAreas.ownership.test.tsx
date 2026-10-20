import { act, renderHook } from '@testing-library/react'
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl'
import useExcavationAreas from 'map/useExcavationAreas'
import {
  deferMapLoad,
  mockAddLayer,
  mockAddSource,
  mockOn,
  mockQueryRenderedFeatures,
  mockSetFeatureState,
  mockSetLayoutProperty,
  mockSetPaintProperty,
  resetMapMocks,
  triggerMapEvent,
} from 'map/mapLibreMock.testSupport'
import {
  EXCAVATION_AREAS_SOURCE_ID,
  EXCAVATION_AREA_FILL_LAYER_ID,
} from 'map/mapExcavationLayers'

jest.mock('maplibre-gl')

beforeEach(resetMapMocks)

it.each([false, true])(
  'ignores stale map callbacks after ownership changes (disposed: %s)',
  (dispose) => {
    deferMapLoad()
    const map = new maplibregl.Map({ container: document.createElement('div') })
    const mapRef: { current: MapLibreMap | null } = { current: map }
    const onSelectPolygon = jest.fn()
    const onAvailabilityChange = jest.fn()
    const { unmount } = renderHook(() =>
      useExcavationAreas(mapRef, {
        isVisible: true,
        selectedPolygonId: 'selected-area',
        onSelectPolygon,
        onAvailabilityChange,
      }),
    )
    const callbacks = mockOn.mock.calls
      .filter(([event]) => event === 'style.load')
      .map(([, callback]) => callback)
    mapRef.current = null
    if (dispose) {
      unmount()
      mapRef.current = map
    }

    act(() => {
      callbacks.forEach((callback) => callback())
      triggerMapEvent(
        'click',
        { point: { x: 10, y: 20 } },
        EXCAVATION_AREA_FILL_LAYER_ID,
      )
      triggerMapEvent('error', {
        error: { message: 'stale source failure' },
        sourceId: EXCAVATION_AREAS_SOURCE_ID,
      })
    })
    ;[
      mockAddLayer,
      mockAddSource,
      mockQueryRenderedFeatures,
      mockSetFeatureState,
      mockSetLayoutProperty,
      mockSetPaintProperty,
      onSelectPolygon,
      onAvailabilityChange,
    ].forEach((callback) => expect(callback).not.toHaveBeenCalled())
  },
)
