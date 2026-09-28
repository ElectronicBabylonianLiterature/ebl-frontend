import { useCallback, type MutableRefObject } from 'react'
import type { Position } from 'geojson'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { drawnRectangleBounds, viewportSearchBounds } from 'map/spatialBounds'
import type { SpatialSearchDrawingStore } from 'map/useSpatialSearchDrawingState'

export interface SpatialSearchDrawingActions {
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

function useClear(store: SpatialSearchDrawingStore): () => void {
  const {
    replaceShape,
    replaceDrawing,
    replaceDrawStart,
    setValidationMessage,
  } = store
  return useCallback((): void => {
    replaceShape(null)
    replaceDrawing(false)
    replaceDrawStart(null)
    setValidationMessage(null)
  }, [replaceDrawStart, replaceDrawing, replaceShape, setValidationMessage])
}

function useAddCorner(
  store: SpatialSearchDrawingStore,
): (position: Position) => void {
  const {
    refs,
    replaceShape,
    replaceDrawing,
    replaceDrawStart,
    setValidationMessage,
  } = store
  return useCallback(
    (position: Position): void => {
      if (!refs.isActive.current || !refs.isDrawing.current) return
      const start = refs.drawStart.current
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
    [
      refs,
      replaceDrawStart,
      replaceDrawing,
      replaceShape,
      setValidationMessage,
    ],
  )
}

function useSearchViewport(
  mapRef: MutableRefObject<MapLibreMap | null>,
  store: SpatialSearchDrawingStore,
): () => void {
  const {
    refs,
    replaceShape,
    replaceDrawing,
    replaceDrawStart,
    setValidationMessage,
  } = store
  return useCallback((): void => {
    const map = mapRef.current
    if (!map || !refs.isActive.current) return
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
  }, [
    mapRef,
    refs,
    replaceDrawStart,
    replaceDrawing,
    replaceShape,
    setValidationMessage,
  ])
}

function useStartDrawing(store: SpatialSearchDrawingStore): () => void {
  const {
    refs,
    replaceShape,
    replaceDrawing,
    replaceDrawStart,
    setValidationMessage,
  } = store
  return useCallback((): void => {
    if (!refs.isActive.current) return
    replaceShape(null)
    replaceDrawStart(null)
    setValidationMessage(null)
    replaceDrawing(true)
  }, [
    refs,
    replaceDrawStart,
    replaceDrawing,
    replaceShape,
    setValidationMessage,
  ])
}

function useAddCornerAtCenter(
  mapRef: MutableRefObject<MapLibreMap | null>,
  store: SpatialSearchDrawingStore,
  addCorner: (position: Position) => void,
): () => void {
  const { refs } = store
  return useCallback((): void => {
    const map = mapRef.current
    if (!map || !refs.isActive.current || !refs.isDrawing.current) return
    const center = map.getCenter()
    const position = finitePosition(center.lng, center.lat)
    if (position) addCorner(position)
  }, [addCorner, mapRef, refs])
}

export default function useSpatialSearchDrawingActions(
  mapRef: MutableRefObject<MapLibreMap | null>,
  store: SpatialSearchDrawingStore,
): SpatialSearchDrawingActions {
  const addCorner = useAddCorner(store)
  return {
    addCorner,
    clear: useClear(store),
    searchViewport: useSearchViewport(mapRef, store),
    startDrawing: useStartDrawing(store),
    addCornerAtCenter: useAddCornerAtCenter(mapRef, store, addCorner),
  }
}
