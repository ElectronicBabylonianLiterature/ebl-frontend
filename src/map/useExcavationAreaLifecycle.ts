import { useEffect, useRef, type MutableRefObject } from 'react'
import type { Map as MapLibreMap, MapMouseEvent } from 'maplibre-gl'
import { observeExcavationAvailability } from 'map/mapExcavationAvailability'
import { MAP_STYLE_LOAD_EVENT } from 'map/mapLayers'
import {
  EXCAVATION_AREA_LAYER_IDS,
  EXCAVATION_AREA_SELECTED_LAYER_ID,
} from 'map/mapExcavationLayers'
import {
  addExcavationAreas,
  removeExcavationAreas,
} from 'map/excavationAreaMap'
import type { ExcavationAreaOptions } from 'map/excavationAreaOptions'
import { EXCAVATION_AREA_FILL_LAYER_ID } from 'map/mapLayerIds'

function createPolygonClickHandler(
  map: MapLibreMap,
  latestOptionsRef: MutableRefObject<ExcavationAreaOptions>,
  isCurrentMap: () => boolean,
): (event: MapMouseEvent) => void {
  return (event) => {
    if (
      !isCurrentMap() ||
      latestOptionsRef.current.isInteractionEnabled === false
    )
      return
    const [feature] = map.queryRenderedFeatures(event.point, {
      layers: [EXCAVATION_AREA_FILL_LAYER_ID],
    })
    if (typeof feature?.id === 'string') {
      latestOptionsRef.current.onSelectPolygon(feature.id)
    }
  }
}

export default function useExcavationAreaLifecycle(
  mapRef: MutableRefObject<MapLibreMap | null>,
  options: ExcavationAreaOptions,
): void {
  const latestOptionsRef = useRef(options)
  latestOptionsRef.current = options

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    let isActive = true
    const ownsMap = (): boolean => mapRef.current === map
    const isCurrentMap = (): boolean => isActive && ownsMap()
    const install = (): void => {
      if (isCurrentMap()) addExcavationAreas(map)
    }
    const handleClick = createPolygonClickHandler(
      map,
      latestOptionsRef,
      isCurrentMap,
    )

    const stopObservingAvailability = observeExcavationAvailability(
      map,
      [...EXCAVATION_AREA_LAYER_IDS, EXCAVATION_AREA_SELECTED_LAYER_ID],
      (unavailable) =>
        latestOptionsRef.current.onAvailabilityChange?.(unavailable),
      isCurrentMap,
    )
    map.on('click', EXCAVATION_AREA_FILL_LAYER_ID, handleClick)
    map.on(MAP_STYLE_LOAD_EVENT, install)
    if (map.getStyle()) install()

    return () => {
      isActive = false
      stopObservingAvailability()
      map.off(MAP_STYLE_LOAD_EVENT, install)
      map.off('click', EXCAVATION_AREA_FILL_LAYER_ID, handleClick)
      if (ownsMap()) removeExcavationAreas(map)
    }
  }, [mapRef])
}
