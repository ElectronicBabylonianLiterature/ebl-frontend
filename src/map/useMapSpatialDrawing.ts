import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
} from 'react'
import type { Position } from 'geojson'
import type { Map as MapLibreMap } from 'maplibre-gl'
import type { BoundingBox } from 'map/mapGeometry'
import type { SpatialSearchShape } from 'map/spatialSearch'
import { isFiniteToolPosition } from 'map/mapToolInput'

const RECTANGLE_CORNERS = 2

export interface MapSpatialDrawing {
  readonly searchShape: SpatialSearchShape | null
  readonly isDrawing: boolean
  readonly cornerCount: number
  readonly addCornerAtCenter: () => void
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

function rectangleFrom(
  corners: readonly Position[],
): SpatialSearchShape | null {
  const [[west, south], [east, north]] = corners
  if (west === east || south === north) return null
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

function appendSpatialPosition(
  position: Position,
  input: {
    readonly isSearching: boolean
    readonly isDrawing: boolean
    readonly corners: readonly Position[]
    readonly replaceCorners: (positions: readonly Position[]) => void
    readonly replaceDrawing: (isDrawing: boolean) => void
    readonly setSearchShape: (shape: SpatialSearchShape) => void
  },
): void {
  if (!isFiniteToolPosition(position)) return
  if (!input.isSearching || !input.isDrawing) return
  const next = [...input.corners, position]
  if (next.length < RECTANGLE_CORNERS) {
    input.replaceCorners(next)
    return
  }
  const rectangle = rectangleFrom(next)
  if (!rectangle) return
  input.setSearchShape(rectangle)
  input.replaceDrawing(false)
  input.replaceCorners([])
}

export default function useMapSpatialDrawing(
  mapRef: MutableRefObject<MapLibreMap | null>,
  isSearching: boolean,
): MapSpatialDrawing {
  const [corners, setCorners] = useState<readonly Position[]>([])
  const cornersRef = useRef(corners)
  const isDrawingRef = useRef(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [searchShape, setSearchShape] = useState<SpatialSearchShape | null>(
    null,
  )

  const replaceCorners = useCallback((next: readonly Position[]): void => {
    cornersRef.current = next
    setCorners(next)
  }, [])
  const replaceDrawing = useCallback((next: boolean): void => {
    isDrawingRef.current = next
    setIsDrawing(next)
  }, [])
  const clearSearch = useCallback((): void => {
    setSearchShape(null)
    replaceCorners([])
    replaceDrawing(false)
  }, [replaceCorners, replaceDrawing])
  useEffect(() => {
    if (!isSearching) {
      replaceDrawing(false)
      replaceCorners([])
    }
  }, [isSearching, replaceDrawing, replaceCorners])

  const addPosition = useCallback(
    (position: Position): void => {
      appendSpatialPosition(position, {
        isSearching,
        isDrawing: isDrawingRef.current,
        corners: cornersRef.current,
        replaceCorners,
        replaceDrawing,
        setSearchShape,
      })
    },
    [isSearching, replaceCorners, replaceDrawing],
  )

  const startDrawing = useCallback((): void => {
    if (!isSearching) return
    setSearchShape(null)
    replaceCorners([])
    replaceDrawing(true)
  }, [isSearching, replaceCorners, replaceDrawing])
  const searchViewport = useCallback((): void => {
    if (!isSearching) return
    const bounds = viewportBounds(mapRef.current)
    clearSearch()
    setSearchShape(bounds === null ? null : { type: 'viewport', bounds })
  }, [isSearching, mapRef, clearSearch])
  const addCornerAtCenter = useCallback((): void => {
    if (!isDrawingRef.current) return
    const center = mapRef.current?.getCenter()
    if (center) addPosition([center.lng, center.lat])
  }, [mapRef, addPosition])

  return {
    searchShape,
    isDrawing,
    cornerCount: corners.length,
    addCornerAtCenter,
    startDrawing,
    searchViewport,
    clearSearch,
    addPosition,
  }
}
