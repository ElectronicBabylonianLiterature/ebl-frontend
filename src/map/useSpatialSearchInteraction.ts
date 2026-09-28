import { useEffect, useRef, type MutableRefObject } from 'react'
import type { Position } from 'geojson'
import type { Map as MapLibreMap, MapMouseEvent } from 'maplibre-gl'
import {
  createSpatialSearchLayerLifecycle,
  type SpatialSearchLayerLifecycle,
} from 'map/mapSpatialSearchLayers'
import type { SpatialSearchDrawingRefs } from 'map/useSpatialSearchDrawing'
import { finitePosition } from 'map/useSpatialSearchDrawing'
import type { SpatialSearchShape } from 'map/spatialSearch'

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return [
    target.isContentEditable,
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName),
  ].some(Boolean)
}

export default function useSpatialSearchInteraction(
  mapRef: MutableRefObject<MapLibreMap | null>,
  isActive: boolean,
  refs: SpatialSearchDrawingRefs,
  drawStart: Position | null,
  shape: SpatialSearchShape | null,
  addCorner: (position: Position) => void,
  clear: () => void,
): void {
  const layerLifecycleRef = useRef<SpatialSearchLayerLifecycle | null>(null)

  useEffect(() => {
    const map = mapRef.current
    if (!map || !isActive) return
    const isCurrentMap = (): boolean => mapRef.current === map
    const lifecycle = createSpatialSearchLayerLifecycle(map, isCurrentMap)
    layerLifecycleRef.current = lifecycle
    lifecycle.update(refs.drawStart.current, refs.shape.current?.bounds ?? [])

    const handleClick = (event: MapMouseEvent): void => {
      if (!refs.isActive.current || !refs.isDrawing.current) return
      const position = finitePosition(event.lngLat.lng, event.lngLat.lat)
      if (position) addCorner(position)
    }
    const handleKeyDown = (event: KeyboardEvent): void => {
      const shouldIgnore = [
        !refs.isActive.current,
        !refs.isDrawing.current,
        isEditableTarget(event.target),
        event.key !== 'Escape',
      ].some(Boolean)
      if (shouldIgnore) return
      event.preventDefault()
      clear()
    }
    map.on('click', handleClick)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      layerLifecycleRef.current = null
      if (isCurrentMap()) map.off('click', handleClick)
      lifecycle.dispose()
    }
  }, [addCorner, clear, isActive, mapRef, refs])

  useEffect(() => {
    layerLifecycleRef.current?.update(drawStart, shape?.bounds ?? [])
  }, [drawStart, shape])
}
