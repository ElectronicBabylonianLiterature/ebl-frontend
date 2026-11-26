import { act, renderHook } from '@testing-library/react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import useMapFeatureSelection from 'map/maplibre/useMapFeatureSelection'
import {
  clearMockStyleResources,
  markLayersAdded,
  mockMapInstance,
  mockOn,
  mockOff,
  mockSetPaintProperty,
  resetMapMocks,
  triggerMapEvent,
} from 'map/testSupport/mapLibreMock'

jest.mock('maplibre-gl')

const LAYERS = [
  'ebl-unclustered-points',
  'excavation-area-fill',
  'excavation-area-outline',
]

beforeEach(() => {
  resetMapMocks()
  markLayersAdded(...LAYERS)
})

it('emphasizes a selected findspot and area with size and outline changes', () => {
  const mapRef = { current: mockMapInstance as unknown as MapLibreMap }
  renderHook(() => useMapFeatureSelection(mapRef, 'Babylon', 'uruk-area'))
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
  expect(mockSetPaintProperty).toHaveBeenCalledWith(
    'excavation-area-fill',
    'fill-opacity',
    ['case', ['==', ['get', 'id'], 'uruk-area'], 0.45, 0.2],
  )
  expect(mockSetPaintProperty).toHaveBeenCalledWith(
    'excavation-area-outline',
    'line-width',
    ['case', ['==', ['get', 'id'], 'uruk-area'], 3.5, 1.75],
  )
})

it('clears emphasis when the inspector closes and restores it after style reload', () => {
  const mapRef = { current: mockMapInstance as unknown as MapLibreMap }
  const { rerender } = renderHook(
    ({ selected }) => useMapFeatureSelection(mapRef, selected, selected),
    { initialProps: { selected: 'selected' as string | null } },
  )
  rerender({ selected: null })
  mockSetPaintProperty.mockClear()
  act(() => triggerMapEvent('style.load'))
  expect(mockSetPaintProperty).toHaveBeenCalledWith(
    'ebl-unclustered-points',
    'circle-radius',
    8,
  )
  expect(mockSetPaintProperty).toHaveBeenCalledWith(
    'excavation-area-outline',
    'line-width',
    1.75,
  )
})

it('waits for a map and layers rather than writing to a missing style', () => {
  renderHook(() => useMapFeatureSelection({ current: null }, null, null))
  expect(mockOn).not.toHaveBeenCalled()
  clearMockStyleResources()
  renderHook(() =>
    useMapFeatureSelection(
      { current: mockMapInstance as unknown as MapLibreMap },
      null,
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
    useMapFeatureSelection(mapRef, 'selected', null),
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

it('reapplies selection when validated assets or their installation are retried', () => {
  const mapRef = { current: mockMapInstance as unknown as MapLibreMap }
  const firstIndex = new Map()
  const { rerender } = renderHook(
    ({ index, retryVersion }) =>
      useMapFeatureSelection(mapRef, null, 'uruk-area', index, retryVersion),
    { initialProps: { index: firstIndex, retryVersion: 0 } },
  )
  mockSetPaintProperty.mockClear()
  rerender({ index: firstIndex, retryVersion: 1 })
  expect(mockSetPaintProperty).toHaveBeenCalledWith(
    'excavation-area-outline',
    'line-width',
    expect.any(Array),
  )
  mockSetPaintProperty.mockClear()
  rerender({ index: new Map(), retryVersion: 1 })
  expect(mockSetPaintProperty).toHaveBeenCalledWith(
    'excavation-area-fill',
    'fill-opacity',
    expect.any(Array),
  )
})
