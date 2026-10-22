import { useRef } from 'react'
import { act, renderHook } from '@testing-library/react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { MAP_STYLE_LOAD_EVENT } from 'map/mapLayers'
import {
  clearMockStyleResources,
  deferMapLoad,
  mockAddLayer,
  mockAddSource,
  mockGetSource,
  mockIsStyleLoaded,
  mockMapInstance,
  mockSetData,
  resetMapMocks,
  triggerMapEvent,
} from 'map/mapLibreMock.testSupport'
import useMapMeasurement, {
  type MeasurementController,
} from 'map/useMapMeasurement'

jest.mock('maplibre-gl')

function useHarness(isActive: boolean): MeasurementController {
  const mapRef = useRef<MapLibreMap | null>(
    mockMapInstance as unknown as MapLibreMap,
  )
  return useMapMeasurement(mapRef, isActive)
}

let sourceReady = false

function configureMockSource(): void {
  mockGetSource.mockImplementation(() =>
    sourceReady ? { setData: mockSetData } : undefined,
  )
}

beforeEach(() => {
  resetMapMocks()
  sourceReady = false
  mockAddSource.mockImplementation(() => {
    sourceReady = true
  })
  configureMockSource()
})

it('draws points when opened during source loading after initial map load', () => {
  deferMapLoad()
  const { result, rerender } = renderHook(({ active }) => useHarness(active), {
    initialProps: { active: false },
  })
  act(() => triggerMapEvent('load'))
  mockIsStyleLoaded.mockReturnValue(false)

  rerender({ active: true })
  act(() => {
    triggerMapEvent('click', {
      point: { x: 1, y: 2 },
      lngLat: { lng: 43, lat: 35 },
    })
    triggerMapEvent('click', {
      point: { x: 2, y: 3 },
      lngLat: { lng: 44, lat: 36 },
    })
  })

  expect(result.current.pointCount).toBe(2)
  expect(mockAddSource).toHaveBeenCalledWith(
    'ebl-measurement',
    expect.any(Object),
  )
  expect(mockAddLayer).toHaveBeenCalledTimes(2)
  expect(mockSetData).toHaveBeenLastCalledWith(
    expect.objectContaining({
      features: expect.arrayContaining([
        expect.objectContaining({
          geometry: {
            type: 'LineString',
            coordinates: [
              [43, 35],
              [44, 36],
            ],
          },
        }),
      ]),
    }),
  )
})

it('restores the latest points and layers after a style replacement', () => {
  const { result } = renderHook(() => useHarness(true))
  act(() => result.current.addPointAtCenter())
  clearMockStyleResources()
  sourceReady = false
  configureMockSource()

  act(() => triggerMapEvent(MAP_STYLE_LOAD_EVENT))

  expect(result.current.pointCount).toBe(1)
  expect(mockAddSource).toHaveBeenCalledTimes(2)
  expect(mockAddLayer).toHaveBeenCalledTimes(4)
  expect(mockSetData).toHaveBeenLastCalledWith(
    expect.objectContaining({
      features: [
        expect.objectContaining({
          geometry: { type: 'Point', coordinates: [43.25, 35.45] },
        }),
      ],
    }),
  )
})
