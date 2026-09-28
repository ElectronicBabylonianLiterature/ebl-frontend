import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from 'react'
import type { Position } from 'geojson'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { drawnRectangleBounds, viewportSearchBounds } from 'map/spatialBounds'
import type { SpatialSearchShape } from 'map/spatialSearch'

export interface SpatialSearchDrawingRefs {
  readonly shape: MutableRefObject<SpatialSearchShape | null>
  readonly isDrawing: MutableRefObject<boolean>
  readonly drawStart: MutableRefObject<Position | null>
  readonly isActive: MutableRefObject<boolean>
}

export interface SpatialSearchDrawingState {
  readonly shape: SpatialSearchShape | null
  readonly isDrawing: boolean
  readonly drawStart: Position | null
  readonly validationMessage: string | null
  readonly refs: SpatialSearchDrawingRefs
  readonly addCorner: (position: Position) => void
  readonly searchViewport: () => void
  readonly startDrawing: () => void
  readonly addCornerAtCenter: () => void
  readonly clear: () => void
}

export function finitePosition(
  longitude: number,
  latitude: number,
): Position | null {
  return Number.isFinite(longitude) && Number.isFinite(latitude)
    ? [longitude, latitude]
    : null
}

export default function useSpatialSearchDrawing(
  mapRef: MutableRefObject<MapLibreMap | null>,
  isActive: boolean,
): SpatialSearchDrawingState {
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
  shapeRef.current = shape
  isDrawingRef.current = isDrawing
  drawStartRef.current = drawStart
  isActiveRef.current = isActive
  const refs = useMemo(
    () => ({
      shape: shapeRef,
      isDrawing: isDrawingRef,
      drawStart: drawStartRef,
      isActive: isActiveRef,
    }),
    [],
  )

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
      if (!isActiveRef.current || !isDrawingRef.current) return
      const start = drawStartRef.current
      if (start === null) {
        setValidationMessage(null)
        replaceDrawStart(position)
        return
      }
      const bounds = drawnRectangleBounds(start, position)
      if (bounds === null) {
        setValidationMessage(
          'Choose a second corner with a different latitude and longitude.',
        )
        return
      }
      setValidationMessage(null)
      replaceShape({ type: 'bounding-box', bounds })
      replaceDrawing(false)
      replaceDrawStart(null)
    },
    [replaceDrawStart, replaceDrawing, replaceShape],
  )
  const searchViewport = useCallback((): void => {
    const map = mapRef.current
    if (!map || !isActiveRef.current) return
    const bounds = map.getBounds()
    const searchBounds = viewportSearchBounds(
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    )
    replaceDrawStart(null)
    replaceDrawing(false)
    setValidationMessage(null)
    replaceShape(
      searchBounds === null ? null : { type: 'viewport', bounds: searchBounds },
    )
  }, [mapRef, replaceDrawStart, replaceDrawing, replaceShape])
  const startDrawing = useCallback((): void => {
    if (!isActiveRef.current) return
    replaceShape(null)
    replaceDrawStart(null)
    setValidationMessage(null)
    replaceDrawing(true)
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

  return {
    shape,
    isDrawing,
    drawStart,
    validationMessage,
    refs,
    addCorner,
    searchViewport,
    startDrawing,
    addCornerAtCenter,
    clear,
  }
}
