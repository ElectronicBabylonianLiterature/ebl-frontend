import { useCallback, useEffect, useMemo, useState } from 'react'
import type { MutableRefObject } from 'react'
import type { Position } from 'geojson'
import type { Map as MapLibreMap, MapMouseEvent } from 'maplibre-gl'
import type { BoundingBox } from 'map/mapGeometry'
import type { PolygonFindspotSummary } from 'map/findspotMapData'
import type { ExcavationPolygonIndex } from 'map/excavationPolygonIndex'
import {
  type SpatialSearchResult,
  type SpatialSearchShape,
  EMPTY_SPATIAL_SEARCH_RESULT,
  runSpatialSearch,
} from 'map/spatialSearch'

export interface SpatialSearchController {
  readonly shape: SpatialSearchShape | null
  readonly result: SpatialSearchResult
  readonly isDrawing: boolean
  readonly searchViewport: () => void
  readonly startDrawing: () => void
  readonly clear: () => void
}

function boundsFromMap(map: MapLibreMap): BoundingBox {
  const bounds = map.getBounds()
  return [
    bounds.getWest(),
    bounds.getSouth(),
    bounds.getEast(),
    bounds.getNorth(),
  ]
}

function boxFromCorners(a: Position, b: Position): BoundingBox {
  return [
    Math.min(a[0], b[0]),
    Math.min(a[1], b[1]),
    Math.max(a[0], b[0]),
    Math.max(a[1], b[1]),
  ]
}

export default function useMapSpatialSearch(
  mapRef: MutableRefObject<MapLibreMap | null>,
  isActive: boolean,
  index: ExcavationPolygonIndex,
  summaries: ReadonlyMap<string, PolygonFindspotSummary>,
): SpatialSearchController {
  const [shape, setShape] = useState<SpatialSearchShape | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawStart, setDrawStart] = useState<Position | null>(null)

  const clear = useCallback(() => {
    setShape(null)
    setIsDrawing(false)
    setDrawStart(null)
  }, [])

  const searchViewport = useCallback(() => {
    const map = mapRef.current
    if (map) setShape({ type: 'viewport', bounds: boundsFromMap(map) })
  }, [mapRef])

  const startDrawing = useCallback(() => {
    setShape(null)
    setDrawStart(null)
    setIsDrawing(true)
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !isActive || !isDrawing) return

    const handleClick = (event: MapMouseEvent): void => {
      const point: Position = [event.lngLat.lng, event.lngLat.lat]
      setDrawStart((start) => {
        if (start === null) return point
        setShape({ type: 'bounding-box', bounds: boxFromCorners(start, point) })
        setIsDrawing(false)
        return null
      })
    }

    map.on('click', handleClick)
    return () => {
      map.off('click', handleClick)
    }
  }, [mapRef, isActive, isDrawing])

  useEffect(() => {
    if (!isActive) clear()
  }, [isActive, clear])

  const result = useMemo(
    () => (shape ? runSpatialSearch(shape, index, summaries) : EMPTY_SPATIAL_SEARCH_RESULT),
    [shape, index, summaries],
  )

  return { shape, result, isDrawing, searchViewport, startDrawing, clear }
}
