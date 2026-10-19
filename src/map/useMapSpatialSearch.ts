import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { MutableRefObject } from 'react'
import type { Position } from 'geojson'
import type { Map as MapLibreMap } from 'maplibre-gl'
import type { ExcavationPolygonIndex } from 'map/excavationPolygonIndex'
import type { FragmentMapDataState } from 'map/useFragmentMapData'
import type { SpatialSearchLayerLifecycle } from 'map/mapSpatialSearchLayers'
import { subscribeSpatialSearch } from 'map/mapSpatialSearchLifecycle'
import { viewportSearchBounds } from 'map/spatialBounds'
import { addSpatialSearchCorner } from 'map/mapSpatialSearchDrawing'
import { finitePosition } from 'map/mapToolInput'
import {
  EMPTY_SPATIAL_SEARCH_RESULT,
  runSpatialSearch,
  type SpatialSearchData,
  type SpatialSearchDataStatus,
  type SpatialSearchResult,
  type SpatialSearchShape,
} from 'map/spatialSearch'

export interface SpatialSearchController {
  readonly shape: SpatialSearchShape | null
  readonly result: SpatialSearchResult
  readonly isDrawing: boolean
  readonly cornerCount: number
  readonly validationMessage: string | null
  readonly searchViewport: () => void
  readonly startDrawing: () => void
  readonly addCornerAtCenter: () => void
  readonly clear: () => void
}

function dataStatus(status: string): SpatialSearchDataStatus {
  if (status === 'loaded-with-mappings' || status === 'loaded-empty') {
    return 'available'
  }
  return status === 'loading' ? 'loading' : 'unavailable'
}

function viewportShape(map: MapLibreMap): SpatialSearchShape | null {
  const viewport = map.getBounds()
  const bounds = viewportSearchBounds(
    viewport.getWest(),
    viewport.getSouth(),
    viewport.getEast(),
    viewport.getNorth(),
  )
  return bounds === null ? null : { type: 'viewport', bounds }
}

export default function useMapSpatialSearch(
  mapRef: MutableRefObject<MapLibreMap | null>,
  isActive: boolean,
  index: ExcavationPolygonIndex,
  fragmentMapData: FragmentMapDataState,
): SpatialSearchController {
  const [shape, setShape] = useState<SpatialSearchShape | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawStart, setDrawStart] = useState<Position | null>(null)
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null,
  )
  const shapeRef = useRef(shape)
  const isDrawingRef = useRef(isDrawing)
  const drawStartRef = useRef(drawStart)
  const isActiveRef = useRef(isActive)
  const layerLifecycleRef = useRef<SpatialSearchLayerLifecycle | null>(null)
  shapeRef.current = shape
  isDrawingRef.current = isDrawing
  drawStartRef.current = drawStart
  isActiveRef.current = isActive

  const replaceShape = useCallback((next: SpatialSearchShape | null): void => {
    shapeRef.current = next
    setShape(next)
  }, [])
  const replaceDrawing = useCallback((next: boolean): void => {
    isDrawingRef.current = next
    setIsDrawing(next)
  }, [])
  const replaceDrawStart = useCallback((next: Position | null): void => {
    drawStartRef.current = next
    setDrawStart(next)
  }, [])
  const clear = useCallback((): void => {
    replaceShape(null)
    replaceDrawing(false)
    replaceDrawStart(null)
    setValidationMessage(null)
  }, [replaceDrawStart, replaceDrawing, replaceShape])

  const addCorner = useCallback(
    (position: Position): void => {
      addSpatialSearchCorner(
        position,
        {
          isActive: isActiveRef.current,
          isDrawing: isDrawingRef.current,
          firstCorner: drawStartRef.current,
        },
        {
          setValidationMessage,
          replaceDrawStart,
          replaceShape,
          replaceDrawing,
        },
      )
    },
    [replaceDrawStart, replaceDrawing, replaceShape],
  )
  const searchViewport = useCallback((): void => {
    const map = mapRef.current
    if (!map || !isActiveRef.current) return
    replaceDrawStart(null)
    replaceDrawing(false)
    setValidationMessage(null)
    replaceShape(viewportShape(map))
  }, [mapRef, replaceDrawStart, replaceDrawing, replaceShape])
  const startDrawing = useCallback((): void => {
    if (isActiveRef.current) {
      replaceShape(null)
      replaceDrawStart(null)
      setValidationMessage(null)
      replaceDrawing(true)
    }
  }, [replaceDrawStart, replaceDrawing, replaceShape])
  const addCornerAtCenter = useCallback((): void => {
    const map = mapRef.current
    if (!map || !isActiveRef.current || !isDrawingRef.current) return
    const center = map.getCenter()
    const position = finitePosition(center.lng, center.lat)
    if (position) addCorner(position)
  }, [addCorner, mapRef])

  useEffect(() => {
    if (!isActive) clear()
  }, [clear, isActive])

  useEffect(() => {
    const lifecycle = subscribeSpatialSearch(
      mapRef,
      () => ({
        isActive: isActiveRef.current,
        isDrawing: isDrawingRef.current,
      }),
      addCorner,
      clear,
    )
    if (!lifecycle) return
    layerLifecycleRef.current = lifecycle
    lifecycle.update(drawStartRef.current, shapeRef.current?.bounds ?? [])

    return () => {
      layerLifecycleRef.current = null
      lifecycle.dispose()
    }
  }, [addCorner, clear, isActive, mapRef])

  useEffect(() => {
    layerLifecycleRef.current?.update(drawStart, shape?.bounds ?? [])
  }, [drawStart, shape])

  const data = useMemo<SpatialSearchData>(
    () => ({
      summaries: fragmentMapData.polygonSummaries,
      siteStatuses: new Map(
        [...fragmentMapData.sites].map(([siteId, site]) => [
          siteId,
          dataStatus(site.status),
        ]),
      ),
    }),
    [fragmentMapData],
  )
  const result = useMemo(
    () =>
      shape
        ? runSpatialSearch(shape, index, data)
        : EMPTY_SPATIAL_SEARCH_RESULT,
    [data, index, shape],
  )

  return {
    shape,
    result,
    isDrawing,
    cornerCount: drawStart === null ? 0 : 1,
    validationMessage,
    searchViewport,
    startDrawing,
    addCornerAtCenter,
    clear,
  }
}
