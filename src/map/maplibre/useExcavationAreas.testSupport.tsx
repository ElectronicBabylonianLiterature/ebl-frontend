import { useEffect, useRef } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import useExcavationAreas from 'map/maplibre/useExcavationAreas'
import type { PolygonVisualizationValues } from 'map/domain/mapVisualizationValues'
import { mockMapInstance, mockRemove } from 'map/testSupport/mapLibreMock'
const POLYGON_INDEX = new Map()

export function Harness({
  isVisible = true,
  selectedPolygonId = null,
  values,
  onSelectPolygon = jest.fn(),
  onAvailabilityChange,
}: {
  readonly isVisible?: boolean
  readonly selectedPolygonId?: string | null
  readonly values?: PolygonVisualizationValues
  readonly onSelectPolygon?: (polygonId: string) => void
  readonly onAvailabilityChange?: (isUnavailable: boolean) => void
}): null {
  const mapRef = useRef<MapLibreMap | null>(
    mockMapInstance as unknown as MapLibreMap,
  )
  useExcavationAreas(mapRef, {
    isVisible,
    polygonIndex: POLYGON_INDEX,
    selectedPolygonId,
    values,
    onSelectPolygon,
    onAvailabilityChange,
  })
  return null
}

export function OwnerTeardownHarness(): null {
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
    polygonIndex: POLYGON_INDEX,
    selectedPolygonId: null,
    onSelectPolygon: jest.fn(),
  })
  return null
}
