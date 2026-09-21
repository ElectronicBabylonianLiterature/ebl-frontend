import React, { useEffect, useRef } from 'react'
import { act, render } from '@testing-library/react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import useExcavationAreas from 'map/useExcavationAreas'
import { EXCAVATION_AREAS_SOURCE_ID } from 'map/mapExcavationLayers'
import {
  deferMapLoad,
  mockAddLayer,
  mockAddSource,
  mockGetLayer,
  mockGetSource,
  mockMapInstance,
  mockRemove,
  mockSetLayoutProperty,
  resetMapMocks,
  triggerMapEvent,
} from 'map/mapLibreMock.testSupport'

jest.mock('maplibre-gl')

function Harness({
  isVisible = true,
  onAvailabilityChange,
}: {
  readonly isVisible?: boolean
  readonly onAvailabilityChange?: (isUnavailable: boolean) => void
}): null {
  const mapRef = useRef<MapLibreMap | null>(
    mockMapInstance as unknown as MapLibreMap,
  )
  useExcavationAreas(mapRef, isVisible, onAvailabilityChange)
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
  useExcavationAreas(mapRef, true)
  return null
}

describe('useExcavationAreas', () => {
  beforeEach(resetMapMocks)

  it('installs both layers and applies visibility after style load', () => {
    const onAvailabilityChange = jest.fn()

    render(
      <Harness isVisible={false} onAvailabilityChange={onAvailabilityChange} />,
    )

    expect(mockAddSource).toHaveBeenCalledWith(
      EXCAVATION_AREAS_SOURCE_ID,
      expect.any(Object),
    )
    expect(mockAddLayer).toHaveBeenCalledTimes(2)
    expect(mockSetLayoutProperty).toHaveBeenCalledTimes(2)
    expect(mockSetLayoutProperty).toHaveBeenCalledWith(
      expect.any(String),
      'visibility',
      'none',
    )
    expect(onAvailabilityChange).not.toHaveBeenCalled()
  })

  it('updates visibility without rebuilding the source or layers', () => {
    const { rerender } = render(<Harness isVisible />)

    expect(mockAddSource).toHaveBeenCalledTimes(1)
    expect(mockAddLayer).toHaveBeenCalledTimes(2)

    rerender(<Harness isVisible={false} />)

    expect(mockAddSource).toHaveBeenCalledTimes(1)
    expect(mockAddLayer).toHaveBeenCalledTimes(2)
    expect(mockSetLayoutProperty).toHaveBeenLastCalledWith(
      expect.any(String),
      'visibility',
      'none',
    )
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

  it('removes a pending one-time load listener on cleanup', () => {
    deferMapLoad()
    const { unmount } = render(<Harness />)

    expect(mockAddSource).not.toHaveBeenCalled()
    unmount()
    act(() => {
      triggerMapEvent('load')
    })

    expect(mockAddSource).not.toHaveBeenCalled()
  })

  it('reports only excavation-source failures as unavailable', () => {
    const onAvailabilityChange = jest.fn()
    render(<Harness onAvailabilityChange={onAvailabilityChange} />)
    onAvailabilityChange.mockClear()

    act(() => {
      triggerMapEvent('error', {
        error: { message: 'asset unavailable' },
        sourceId: EXCAVATION_AREAS_SOURCE_ID,
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
