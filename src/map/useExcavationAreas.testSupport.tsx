import { useRef } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import useExcavationAreas from 'map/useExcavationAreas'
import type { PolygonVisualizationValues } from 'map/mapVisualizationValues'
import { mockMapInstance } from 'map/mapLibreMock.testSupport'
import { useDisposingMockMap } from 'map/mapLibreDisposedMock.testSupport'
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
  const mapRef = useDisposingMockMap()
  useExcavationAreas(mapRef, {
    isVisible: true,
    polygonIndex: POLYGON_INDEX,
    selectedPolygonId: null,
    onSelectPolygon: jest.fn(),
  })
  return null
}
