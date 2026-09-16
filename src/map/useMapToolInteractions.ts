import { useCallback, useEffect, useMemo, useState } from 'react'
import type { MutableRefObject } from 'react'
import type { Position } from 'geojson'
import type { Map as MapLibreMap } from 'maplibre-gl'
import type { PolygonFindspotSummary } from './findspotMapData'
import type { ExcavationPolygonIndex } from './excavationPolygonIndex'
import type { BoundingBox } from './mapGeometry'
import type { MeasurementMode, MeasurementUnits } from './mapMeasurement'
import {
  EMPTY_SPATIAL_SEARCH_RESULT,
  type SpatialSearchShape,
  runSpatialSearch,
} from './spatialSearch'

const RECTANGLE_CORNERS = 2

export interface MapToolInteractions {
  readonly measurementPositions: readonly Position[]
  readonly measurementMode: MeasurementMode
  readonly measurementUnits: MeasurementUnits
  readonly setMeasurementMode: (mode: MeasurementMode) => void
  readonly setMeasurementUnits: (units: MeasurementUnits) => void
  readonly clearMeasurement: () => void
  readonly searchShape: SpatialSearchShape | null
  readonly searchResult: ReturnType<typeof runSpatialSearch>
  readonly isDrawing: boolean
  readonly startDrawing: () => void
  readonly searchViewport: () => void
  readonly clearSearch: () => void
  readonly addPosition: (position: Position) => void
}

function viewportBounds(map: MapLibreMap | null): BoundingBox | null {
  const bounds = map?.getBounds?.()
  return bounds
    ? [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()]
    : null
}

function rectangleFrom(corners: readonly Position[]): SpatialSearchShape {
  const [[west, south], [east, north]] = corners
  return {
    type: 'bounding-box',
    bounds: [
      Math.min(west, east),
      Math.min(south, north),
      Math.max(west, east),
      Math.max(south, north),
    ],
  }
}

export default function useMapToolInteractions(
  mapRef: MutableRefObject<MapLibreMap | null>,
  index: ExcavationPolygonIndex,
  summaries: ReadonlyMap<string, PolygonFindspotSummary>,
  isMeasuring: boolean,
  isSearching: boolean,
): MapToolInteractions {
  const [measurementPositions, setMeasurementPositions] = useState<
    readonly Position[]
  >([])
  const [measurementMode, setMeasurementMode] =
    useState<MeasurementMode>('distance')
  const [measurementUnits, setMeasurementUnits] =
    useState<MeasurementUnits>('metric')
  const [, setCorners] = useState<readonly Position[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [searchShape, setSearchShape] = useState<SpatialSearchShape | null>(
    null,
  )

  useEffect(() => {
    if (!isMeasuring) setMeasurementPositions([])
  }, [isMeasuring])

  useEffect(() => {
    if (!isSearching) {
      setIsDrawing(false)
      setCorners([])
    }
  }, [isSearching])

  const addPosition = useCallback(
    (position: Position) => {
      if (isMeasuring) {
        setMeasurementPositions((current) => [...current, position])
        return
      }

      if (!isDrawing) return

      setCorners((current) => {
        const next = [...current, position]
        if (next.length < RECTANGLE_CORNERS) return next

        setSearchShape(rectangleFrom(next))
        setIsDrawing(false)
        return []
      })
    },
    [isMeasuring, isDrawing],
  )

  useEffect(() => {
    const map = mapRef.current
    if (map === null || !(isMeasuring || isDrawing)) return

    const collect = (event: { lngLat: { lng: number; lat: number } }): void =>
      addPosition([event.lngLat.lng, event.lngLat.lat])

    map.on('click', collect)
    return () => {
      map.off('click', collect)
    }
  }, [mapRef, isMeasuring, isDrawing, addPosition])

  const searchResult = useMemo(
    () =>
      searchShape === null
        ? EMPTY_SPATIAL_SEARCH_RESULT
        : runSpatialSearch(searchShape, index, summaries),
    [searchShape, index, summaries],
  )

  return {
    measurementPositions,
    measurementMode,
    measurementUnits,
    setMeasurementMode,
    setMeasurementUnits,
    clearMeasurement: useCallback(() => setMeasurementPositions([]), []),
    searchShape,
    searchResult,
    isDrawing,
    startDrawing: useCallback(() => {
      setCorners([])
      setIsDrawing(true)
    }, []),
    searchViewport: useCallback(() => {
      const bounds = viewportBounds(mapRef.current)
      setSearchShape(bounds === null ? null : { type: 'viewport', bounds })
    }, [mapRef]),
    clearSearch: useCallback(() => {
      setSearchShape(null)
      setCorners([])
      setIsDrawing(false)
    }, []),
    addPosition,
  }
}
