import type { MutableRefObject } from 'react'
import type { Position } from 'geojson'
import type { Map as MapLibreMap, MapMouseEvent } from 'maplibre-gl'
import {
  createSpatialSearchLayerLifecycle,
  type SpatialSearchLayerLifecycle,
} from 'map/mapSpatialSearchLayers'
import { finitePosition, isEditableTarget } from 'map/mapToolInput'

interface SpatialDrawingState {
  readonly isActive: boolean
  readonly isDrawing: boolean
}

function handleDrawingKeyDown(
  event: KeyboardEvent,
  state: SpatialDrawingState,
  clear: () => void,
): void {
  if (!state.isActive || !state.isDrawing || isEditableTarget(event.target))
    return
  if (event.key === 'Escape') {
    event.preventDefault()
    clear()
  }
}

export function subscribeSpatialSearch(
  mapRef: MutableRefObject<MapLibreMap | null>,
  getState: () => SpatialDrawingState,
  addCorner: (position: Position) => void,
  clear: () => void,
): SpatialSearchLayerLifecycle | null {
  const map = mapRef.current
  if (!map || !getState().isActive) return null
  let isDisposed = false
  const isCurrentMap = (): boolean => mapRef.current === map
  const isCurrentSubscription = (): boolean => !isDisposed && isCurrentMap()
  const lifecycle = createSpatialSearchLayerLifecycle(map, isCurrentMap)
  const handleClick = (event: MapMouseEvent): void => {
    if (!isCurrentSubscription()) return
    const { isActive, isDrawing } = getState()
    if (!isActive || !isDrawing) return
    const position = finitePosition(event.lngLat.lng, event.lngLat.lat)
    if (position) addCorner(position)
  }
  const handleKeyDown = (event: KeyboardEvent): void => {
    if (isCurrentSubscription()) {
      handleDrawingKeyDown(event, getState(), clear)
    }
  }

  map.on('click', handleClick)
  window.addEventListener('keydown', handleKeyDown)

  return {
    update: lifecycle.update,
    dispose(): void {
      isDisposed = true
      window.removeEventListener('keydown', handleKeyDown)
      map.off('click', handleClick)
      lifecycle.dispose()
    },
  }
}
