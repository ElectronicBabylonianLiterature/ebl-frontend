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
  mockSetFeatureState,
} from 'map/mapLibreMock.testSupport'
import type { PolygonVisualizationValues } from 'map/mapVisualizationValues'
import {
  EVIDENCE_PAINT,
  type ExcavationPaint,
  excavationPaintProperties,
} from 'map/mapExcavationPaint'

jest.mock('maplibre-gl')

function Harness({
  isVisible,
  selectedPolygonId = null,
  values,
  paint,
}: {
  isVisible: boolean
  selectedPolygonId?: string | null
  values?: PolygonVisualizationValues
  paint?: ExcavationPaint
}): null {
  const mapRef = useRef<MapLibreMap | null>(
    mockMapInstance as unknown as MapLibreMap,
  )
  useExcavationAreas(mapRef, {
    isVisible,
    selectedPolygonId,
    onSelectPolygon: jest.fn(),
    values,
    paint,
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
  expect(mockSetFeatureState).toHaveBeenCalledWith(
    { source: 'excavation-areas', id: 'area-1' },
    { selected: true },
  )
})

it('updates paint and values on existing resources while source data is pending', () => {
  const { rerender } = render(<Harness isVisible={false} />)
  mockIsStyleLoaded.mockReturnValue(false)
  const value = {
    polygonId: 'area-1',
    dataAvailable: true,
    findspotCount: 2,
    accessibleFragmentCount: 7,
    areaSquareKm: 3.5,
    densityAvailable: true,
    densityPerSquareKm: 2,
    mappingEvidence: 'verified-source' as const,
  }
  const values = new Map([['area-1', value]])
  rerender(<Harness isVisible values={values} paint={EVIDENCE_PAINT} />)
  expect(mockSetFeatureState).toHaveBeenCalledWith(
    { source: 'excavation-areas', id: 'area-1' },
    expect.objectContaining({ accessibleFragmentCount: 7 }),
  )
  expect(mockSetPaintProperty).toHaveBeenCalledWith(
    'excavation-area-fill',
    'fill-color',
    excavationPaintProperties(EVIDENCE_PAINT).fillColor,
  )
  mockGetSource.mockReturnValue(undefined)
  mockSetFeatureState.mockClear()
  rerender(
    <Harness
      isVisible
      selectedPolygonId="missing-source"
      values={new Map(values)}
    />,
  )
  expect(mockSetFeatureState).not.toHaveBeenCalled()
})
