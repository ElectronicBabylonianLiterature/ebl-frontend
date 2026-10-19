import { act, renderHook } from '@testing-library/react'
import { useRef } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import useMapMeasurement from 'map/useMapMeasurement'
import {
  mockAddLayer,
  mockAddSource,
  mockGetSource,
  mockIsStyleLoaded,
  mockMapInstance,
  mockSetData,
  resetMapMocks,
} from 'map/mapLibreMock.testSupport'
import useMapSpatialSearch from 'map/useMapSpatialSearch'
import type { FragmentMapDataState } from 'map/useFragmentMapData'

jest.mock('maplibre-gl')

beforeEach(() => {
  resetMapMocks()
  mockAddSource.mockImplementation(() => {
    mockGetSource.mockReturnValue({ setData: mockSetData })
  })
})

it('activates measurement after style load while another source is still pending', () => {
  const { result, rerender } = renderHook(
    ({ active }) => {
      const mapRef = useRef(mockMapInstance as unknown as MapLibreMap)
      return useMapMeasurement(mapRef, active)
    },
    { initialProps: { active: false } },
  )
  mockIsStyleLoaded.mockReturnValue(false)
  rerender({ active: true })
  act(() => result.current.addPointAtCenter())
  expect(mockAddSource).toHaveBeenCalledWith(
    'ebl-measurement',
    expect.any(Object),
  )
  expect(mockAddLayer).toHaveBeenCalledTimes(2)
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

it('activates and updates spatial drawing while another source is still pending', () => {
  const data = {
    sites: new Map(),
    findspots: [],
    polygonSummaries: new Map(),
  } as unknown as FragmentMapDataState
  const { result, rerender } = renderHook(
    ({ active }) => {
      const mapRef = useRef(mockMapInstance as unknown as MapLibreMap)
      return useMapSpatialSearch(mapRef, active, new Map(), data)
    },
    { initialProps: { active: false } },
  )
  mockIsStyleLoaded.mockReturnValue(false)
  rerender({ active: true })
  act(() => result.current.searchViewport())
  expect(mockAddSource).toHaveBeenCalledWith(
    'ebl-spatial-search',
    expect.any(Object),
  )
  expect(mockAddLayer).toHaveBeenCalledTimes(3)
  expect(result.current.shape).toEqual({
    type: 'viewport',
    bounds: [[43, 35, 44, 36]],
  })
  expect(mockSetData).toHaveBeenLastCalledWith(
    expect.objectContaining({
      features: [
        expect.objectContaining({
          geometry: expect.objectContaining({ type: 'Polygon' }),
        }),
      ],
    }),
  )
})
