import React, { useEffect, useRef } from 'react'
import { act, render } from '@testing-library/react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import useExcavationAreas from 'map/useExcavationAreas'
import {
  EXCAVATION_AREAS_SOURCE_ID,
  EXCAVATION_AREA_FILL_LAYER_ID,
  EXCAVATION_AREA_SELECTED_LAYER_ID,
} from 'map/mapExcavationLayers'
import {
  deferMapLoad,
  mockAddLayer,
  mockAddSource,
  mockGetLayer,
  mockGetSource,
  mockMapInstance,
  mockQueryRenderedFeatures,
  mockRemove,
  mockSetLayoutProperty,
  mockSetPaintProperty,
  resetMapMocks,
  triggerMapEvent,
} from 'map/mapLibreMock.testSupport'

jest.mock('maplibre-gl')

const ASSUR_POLYGON_ID = 'assur-bb6i-3d76dc1e02af'

function Harness({
  isVisible = true,
  selectedPolygonId = null,
  onSelectPolygon = jest.fn(),
  onAvailabilityChange,
}: {
  readonly isVisible?: boolean
  readonly selectedPolygonId?: string | null
  readonly onSelectPolygon?: (polygonId: string) => void
  readonly onAvailabilityChange?: (isUnavailable: boolean) => void
}): null {
  const mapRef = useRef<MapLibreMap | null>(
    mockMapInstance as unknown as MapLibreMap,
  )
  useExcavationAreas(mapRef, {
    isVisible,
    selectedPolygonId,
    onSelectPolygon,
    onAvailabilityChange,
  })
  return null
}

function OwnerTeardownHarness(): null {
  const mapRef = useRef<MapLibreMap | null>(
    mockMapInstance as unknown as MapLibreMap,
  )
  useEffect(
    () => () => {
      mockRemove()
      mapRef.current = null
    },
    [],
  )
  useExcavationAreas(mapRef, {
    isVisible: true,
    selectedPolygonId: null,
    onSelectPolygon: jest.fn(),
  })
  return null
}

describe('useExcavationAreas', () => {
  beforeEach(resetMapMocks)

  it('installs all layers and applies visibility after style load', () => {
    const onAvailabilityChange = jest.fn()

    render(
      <Harness isVisible={false} onAvailabilityChange={onAvailabilityChange} />,
    )

    expect(mockAddSource).toHaveBeenCalledWith(
      EXCAVATION_AREAS_SOURCE_ID,
      expect.any(Object),
    )
    expect(mockAddLayer).toHaveBeenCalledTimes(3)
    expect(mockSetLayoutProperty).toHaveBeenCalledTimes(3)
    expect(mockSetLayoutProperty).toHaveBeenCalledWith(
      expect.any(String),
      'visibility',
      'none',
    )
    expect(onAvailabilityChange).not.toHaveBeenCalled()
  })

  it('updates visibility without rebuilding the source or layers', () => {
    const { rerender } = render(<Harness isVisible />)

    rerender(<Harness isVisible={false} />)

    expect(mockAddSource).toHaveBeenCalledTimes(1)
    expect(mockAddLayer).toHaveBeenCalledTimes(3)
    expect(mockSetLayoutProperty).toHaveBeenLastCalledWith(
      expect.any(String),
      'visibility',
      'none',
    )
  })

  it('updates canonical selection paint without rebuilding layers', () => {
    const { rerender } = render(<Harness selectedPolygonId={null} />)
    mockSetPaintProperty.mockClear()

    rerender(<Harness selectedPolygonId={ASSUR_POLYGON_ID} />)

    expect(mockAddSource).toHaveBeenCalledTimes(1)
    expect(mockAddLayer).toHaveBeenCalledTimes(3)
    expect(mockSetPaintProperty).toHaveBeenCalledWith(
      EXCAVATION_AREA_SELECTED_LAYER_ID,
      'line-opacity',
      ['case', ['==', ['get', 'id'], ASSUR_POLYGON_ID], 0.9, 0],
    )
  })

  it('selects the canonical promoted feature id on polygon click', () => {
    const onSelectPolygon = jest.fn()
    mockQueryRenderedFeatures.mockReturnValue([
      { id: ASSUR_POLYGON_ID, properties: { id: 'untrusted-property' } },
    ])
    render(<Harness onSelectPolygon={onSelectPolygon} />)

    act(() => {
      triggerMapEvent(
        'click',
        { point: { x: 10, y: 20 } },
        EXCAVATION_AREA_FILL_LAYER_ID,
      )
    })

    expect(onSelectPolygon).toHaveBeenCalledWith(ASSUR_POLYGON_ID)
  })

  it('skips subordinate cleanup after the map owner disposes it', () => {
    let isRemoved = false
    mockRemove.mockImplementation(() => {
      isRemoved = true
    })
    mockGetLayer.mockImplementation(() => {
      if (isRemoved) throw new Error('map style has been removed')
      return undefined
    })
    mockGetSource.mockImplementation(() => {
      if (isRemoved) throw new Error('map style has been removed')
      return undefined
    })

    const { unmount } = render(<OwnerTeardownHarness />)

    expect(unmount).not.toThrow()
    expect(mockRemove).toHaveBeenCalled()
  })

  it('removes pending one-time load listeners on cleanup', () => {
    deferMapLoad()
    const { unmount } = render(<Harness />)

    expect(mockAddSource).not.toHaveBeenCalled()
    unmount()
    act(() => {
      triggerMapEvent('load')
    })

    expect(mockAddSource).not.toHaveBeenCalled()
  })

  it('reports only excavation source and layer failures', () => {
    const onAvailabilityChange = jest.fn()
    render(<Harness onAvailabilityChange={onAvailabilityChange} />)
    onAvailabilityChange.mockClear()

    act(() => {
      triggerMapEvent('error', {
        error: { message: 'asset unavailable' },
        layer: { id: EXCAVATION_AREA_SELECTED_LAYER_ID },
      })
    })
    expect(onAvailabilityChange).toHaveBeenCalledWith(true)

    onAvailabilityChange.mockClear()
    act(() => {
      triggerMapEvent('error', {
        error: { message: 'other source' },
        sourceId: 'ebl-findspots',
      })
    })
    expect(onAvailabilityChange).not.toHaveBeenCalled()
  })
})
