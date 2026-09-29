import { useEffect, useRef, type MutableRefObject } from 'react'
import type { Map as MapLibreMap, MapMouseEvent } from 'maplibre-gl'
import type { MapLibreErrorEvent } from 'map/mapBackgroundError'
import {
  addExcavationAreas,
  isExcavationAreaError,
  removeExcavationAreas,
} from 'map/excavationAreaMap'
import type { ExcavationAreaOptions } from 'map/excavationAreaOptions'
import { EXCAVATION_AREA_FILL_LAYER_ID } from 'map/mapLayerIds'

export default function useExcavationAreaLifecycle(
  mapRef: MutableRefObject<MapLibreMap | null>,
  options: ExcavationAreaOptions,
): void {
  const latestOptionsRef = useRef(options)
  latestOptionsRef.current = options

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const isCurrentMap = (): boolean => mapRef.current === map
    const install = (): void => addExcavationAreas(map)
    const handleError = (event: MapLibreErrorEvent): void => {
      if (isExcavationAreaError(event)) {
        latestOptionsRef.current.onAvailabilityChange?.(true)
      }
    }
    const handleClick = (event: MapMouseEvent): void => {
      if (latestOptionsRef.current.isInteractionEnabled === false) return
      const [feature] = map.queryRenderedFeatures(event.point, {
        layers: [EXCAVATION_AREA_FILL_LAYER_ID],
      })
      if (typeof feature?.id === 'string') {
        latestOptionsRef.current.onSelectPolygon(feature.id)
      }
    }

    map.on('error', handleError)
    map.on('click', EXCAVATION_AREA_FILL_LAYER_ID, handleClick)
    if (map.isStyleLoaded()) install()
    else map.once('load', install)

    return () => {
      if (!isCurrentMap()) return
      map.off('error', handleError)
      map.off('load', install)
      map.off('click', EXCAVATION_AREA_FILL_LAYER_ID, handleClick)
      removeExcavationAreas(map)
    }
  }, [mapRef])
}
