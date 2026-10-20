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

interface SpatialSearchInteractionOptions {
  readonly isActive: boolean
  readonly refs: SpatialSearchDrawingRefs
  readonly drawStart: Position | null
  readonly shape: SpatialSearchShape | null
  readonly addCorner: (position: Position) => void
  readonly clear: () => void
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return [
    target.isContentEditable,
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName),
  ].some(Boolean)
}

export default function useSpatialSearchInteraction(
  mapRef: MutableRefObject<MapLibreMap | null>,
  options: SpatialSearchInteractionOptions,
): void {
  const { isActive, refs, drawStart, shape, addCorner, clear } = options
  const layerLifecycleRef = useRef<SpatialSearchLayerLifecycle | null>(null)

  useEffect(() => {
    const map = mapRef.current
    if (!map || !isActive) return
    let isDisposed = false
    const isCurrentMap = (): boolean => mapRef.current === map
    const isCurrentSubscription = (): boolean => !isDisposed && isCurrentMap()
    const lifecycle = createSpatialSearchLayerLifecycle(map, isCurrentMap)
    layerLifecycleRef.current = lifecycle
    lifecycle.update(refs.drawStart.current, refs.shape.current?.bounds ?? [])

    const handleClick = (event: MapMouseEvent): void => {
      const shouldIgnore = [
        !isCurrentSubscription(),
        !refs.isActive.current,
        !refs.isDrawing.current,
      ].some(Boolean)
      if (shouldIgnore) return
      const position = finitePosition(event.lngLat.lng, event.lngLat.lat)
      if (position) addCorner(position)
    }
    const handleKeyDown = (event: KeyboardEvent): void => {
      const shouldIgnore = [
        !isCurrentSubscription(),
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
      isDisposed = true
      window.removeEventListener('keydown', handleKeyDown)
      layerLifecycleRef.current = null
      map.off('click', handleClick)
      lifecycle.dispose()
    }
  }, [addCorner, clear, isActive, mapRef, refs])

  useEffect(() => {
    layerLifecycleRef.current?.update(drawStart, shape?.bounds ?? [])
  }, [drawStart, shape])
}
