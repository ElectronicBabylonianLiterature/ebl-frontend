import React, { useRef } from 'react'
import { render } from '@testing-library/react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import useExcavationAreas from 'map/useExcavationAreas'
import {
  mockAddLayer,
  mockAddSource,
  mockGetSource,
  mockIsStyleLoaded,
  mockMapInstance,
  mockSetLayoutProperty,
  resetMapMocks,
  mockSetPaintProperty,
} from 'map/mapLibreMock.testSupport'

jest.mock('maplibre-gl')

function Harness({
  isVisible,
  selectedPolygonId = null,
}: {
  isVisible: boolean
  selectedPolygonId?: string | null
}): null {
  const mapRef = useRef<MapLibreMap | null>(
    mockMapInstance as unknown as MapLibreMap,
  )
  useExcavationAreas(mapRef, {
    isVisible,
    selectedPolygonId,
    onSelectPolygon: jest.fn(),
  })
  return null
}

beforeEach(() => {
  resetMapMocks()
  mockAddSource.mockImplementation(() => {
    mockGetSource.mockReturnValue({})
  })
})

it('installs layers when the style exists while source data is pending', () => {
  mockIsStyleLoaded.mockReturnValue(false)
  render(<Harness isVisible />)
  expect(mockAddSource).toHaveBeenCalledWith(
    'excavation-areas',
    expect.any(Object),
  )
  expect(mockAddLayer).toHaveBeenCalled()
  expect(mockSetLayoutProperty).toHaveBeenCalledWith(
    'excavation-area-fill',
    'visibility',
    'visible',
  )
})

it('applies newly enabled visibility while source data is pending without another style event', () => {
  const { rerender } = render(<Harness isVisible={false} />)
  mockIsStyleLoaded.mockReturnValue(false)
  mockSetLayoutProperty.mockClear()
  rerender(<Harness isVisible />)
  expect(mockSetLayoutProperty).toHaveBeenCalledWith(
    'excavation-area-fill',
    'visibility',
    'visible',
  )
  expect(mockSetLayoutProperty).toHaveBeenCalledWith(
    'excavation-area-outline',
    'visibility',
    'visible',
  )
})

it('applies the latest selected polygon while source data is pending', () => {
  const { rerender } = render(<Harness isVisible={false} />)
  mockIsStyleLoaded.mockReturnValue(false)
  rerender(<Harness isVisible selectedPolygonId="area-1" />)
  expect(mockSetPaintProperty).toHaveBeenCalledWith(
    'excavation-area-selected',
    'line-opacity',
    ['case', ['==', ['get', 'id'], 'area-1'], 0.9, 0],
  )
})
