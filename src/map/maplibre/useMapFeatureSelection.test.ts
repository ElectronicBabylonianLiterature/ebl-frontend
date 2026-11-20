import { act, renderHook } from '@testing-library/react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import useMapFeatureSelection from 'map/maplibre/useMapFeatureSelection'
import useExcavationAreas from 'map/maplibre/useExcavationAreas'
import type { ExcavationPolygonIndex } from 'map/domain/excavationPolygonIndex'
import {
  clearMockStyleResources,
  markLayersAdded,
  mockGetSource,
  mockMapInstance,
  mockOn,
  mockOff,
  mockSetFeatureState,
  mockSetPaintProperty,
  resetMapMocks,
  triggerMapEvent,
} from 'map/testSupport/mapLibreMock'

jest.mock('maplibre-gl')

const INDEX: ExcavationPolygonIndex = new Map()
const LAYERS = [
  'ebl-unclustered-points',
  'excavation-area-fill',
  'excavation-area-outline',
  'excavation-area-selected',
]

function useSelection(
  mapRef: { current: MapLibreMap | null },
  selected: string | null,
  index: ExcavationPolygonIndex = INDEX,
  retryVersion = 0,
): void {
  useMapFeatureSelection(mapRef, selected, retryVersion)
  useExcavationAreas(mapRef, {
    isVisible: true,
    selectedPolygonId: selected,
    polygonIndex: index,
    retryVersion,
  })
}

beforeEach(() => {
  resetMapMocks()
  markLayersAdded(...LAYERS)
  mockGetSource.mockReturnValue({})
})

it('emphasizes the selected findspot without replacing excavation feature-state paint', () => {
  const mapRef = { current: mockMapInstance as unknown as MapLibreMap }
  renderHook(() => useSelection(mapRef, 'Babylon'))
  expect(mockSetPaintProperty).toHaveBeenCalledWith(
    'ebl-unclustered-points',
    'circle-radius',
    ['case', ['==', ['get', 'id'], 'Babylon'], 12, 8],
  )
  expect(mockSetPaintProperty).toHaveBeenCalledWith(
    'ebl-unclustered-points',
    'circle-stroke-width',
    ['case', ['==', ['get', 'id'], 'Babylon'], 4, 2],
  )
  expect(mockSetFeatureState).toHaveBeenCalledWith(
    { source: 'excavation-areas', id: 'Babylon' },
    { selected: true },
  )
  expect(mockSetPaintProperty).not.toHaveBeenCalledWith(
    'excavation-area-fill',
    'fill-opacity',
    ['case', ['==', ['get', 'id'], 'Babylon'], 0.45, 0.2],
  )
})

it('clears emphasis when the inspector closes and restores defaults after style reload', () => {
  const mapRef = { current: mockMapInstance as unknown as MapLibreMap }
  const { rerender } = renderHook(
    ({ selected }) => useSelection(mapRef, selected),
    { initialProps: { selected: 'selected' as string | null } },
  )
  rerender({ selected: null })
  expect(mockSetFeatureState).toHaveBeenCalledWith(
    { source: 'excavation-areas', id: 'selected' },
    { selected: false },
  )
  mockSetPaintProperty.mockClear()
  act(() => triggerMapEvent('style.load'))
  expect(mockSetPaintProperty).toHaveBeenCalledWith(
    'ebl-unclustered-points',
    'circle-radius',
    8,
  )
})

it('waits for a map and layers rather than writing to a missing style', () => {
  renderHook(() => useMapFeatureSelection({ current: null }, null))
  expect(mockOn).not.toHaveBeenCalled()
  clearMockStyleResources()
  renderHook(() =>
    useMapFeatureSelection(
      { current: mockMapInstance as unknown as MapLibreMap },
      null,
    ),
  )
  expect(mockSetPaintProperty).not.toHaveBeenCalled()
})

it('ignores stale owner events and callbacks captured before unmount', () => {
  const mapRef: { current: MapLibreMap | null } = {
    current: mockMapInstance as unknown as MapLibreMap,
  }
  const { unmount } = renderHook(() =>
    useMapFeatureSelection(mapRef, 'selected'),
  )
  const callback = mockOn.mock.calls.find(
    ([name]) => name === 'style.load',
  )?.[1]
  mockSetPaintProperty.mockClear()
  mapRef.current = null
  act(() => triggerMapEvent('style.load'))
  expect(mockSetPaintProperty).not.toHaveBeenCalled()
  unmount()
  act(() => callback())
  expect(mockSetPaintProperty).not.toHaveBeenCalled()
  expect(mockOff).toHaveBeenCalledWith('style.load', callback)
})

it('reapplies selected feature state after asset replacement and retry', () => {
  const mapRef = { current: mockMapInstance as unknown as MapLibreMap }
  const firstIndex = new Map()
  const { rerender } = renderHook(
    ({ index, retryVersion }) =>
      useSelection(mapRef, 'uruk-area', index, retryVersion),
    { initialProps: { index: firstIndex, retryVersion: 0 } },
  )
  mockSetFeatureState.mockClear()
  rerender({ index: firstIndex, retryVersion: 1 })
  expect(mockSetFeatureState).toHaveBeenCalledWith(
    { source: 'excavation-areas', id: 'uruk-area' },
    { selected: true },
  )
  mockSetFeatureState.mockClear()
  rerender({ index: new Map(), retryVersion: 1 })
  expect(mockSetFeatureState).toHaveBeenCalledWith(
    { source: 'excavation-areas', id: 'uruk-area' },
    { selected: true },
  )
})
