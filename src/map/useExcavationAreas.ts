import { useEffect } from 'react'
import type { MutableRefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import type { MapLibreErrorEvent } from 'map/mapBackgroundError'
import {
  EXCAVATION_AREAS_SOURCE_ID,
  EXCAVATION_AREA_LAYER_IDS,
  createExcavationAreasSource,
  excavationAreaFillLayer,
  excavationAreaOutlineLayer,
} from 'map/mapExcavationLayers'

function addExcavationAreas(map: MapLibreMap): void {
  if (!map.getSource(EXCAVATION_AREAS_SOURCE_ID)) {
    map.addSource(EXCAVATION_AREAS_SOURCE_ID, createExcavationAreasSource())
  }
  if (!map.getLayer(excavationAreaFillLayer.id)) {
    map.addLayer(excavationAreaFillLayer)
  }
  if (!map.getLayer(excavationAreaOutlineLayer.id)) {
    map.addLayer(excavationAreaOutlineLayer)
  }
}

function removeExcavationAreas(map: MapLibreMap): void {
  EXCAVATION_AREA_LAYER_IDS.forEach((layerId) => {
    if (map.getLayer(layerId)) map.removeLayer(layerId)
  })
  if (map.getSource(EXCAVATION_AREAS_SOURCE_ID)) {
    map.removeSource(EXCAVATION_AREAS_SOURCE_ID)
  }
}

function setExcavationAreasVisible(map: MapLibreMap, isVisible: boolean): void {
  EXCAVATION_AREA_LAYER_IDS.forEach((layerId) => {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(
        layerId,
        'visibility',
        isVisible ? 'visible' : 'none',
      )
    }
  })
}

function isExcavationAreaError(event: MapLibreErrorEvent): boolean {
  return (
    event.sourceId === EXCAVATION_AREAS_SOURCE_ID ||
    (typeof event.layer?.id === 'string' &&
      EXCAVATION_AREA_LAYER_IDS.includes(event.layer.id))
  )
}

export default function useExcavationAreas(
  mapRef: MutableRefObject<MapLibreMap | null>,
  isVisible: boolean,
  onAvailabilityChange?: (isUnavailable: boolean) => void,
): void {
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const isCurrentMap = (): boolean => mapRef.current === map
    const install = (): void => addExcavationAreas(map)
    const handleError = (event: MapLibreErrorEvent): void => {
      if (isExcavationAreaError(event)) onAvailabilityChange?.(true)
    }

    map.on('error', handleError)
    if (map.isStyleLoaded()) install()
    else map.once('load', install)

    return () => {
      if (!isCurrentMap()) return
      map.off('error', handleError)
      map.off('load', install)
      removeExcavationAreas(map)
    }
  }, [mapRef, onAvailabilityChange])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const isCurrentMap = (): boolean => mapRef.current === map
    const updateVisibility = (): void =>
      setExcavationAreasVisible(map, isVisible)

    if (map.isStyleLoaded()) updateVisibility()
    else map.once('load', updateVisibility)

    return () => {
      if (isCurrentMap()) map.off('load', updateVisibility)
    }
  }, [mapRef, isVisible])
}
