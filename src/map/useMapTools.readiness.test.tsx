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
