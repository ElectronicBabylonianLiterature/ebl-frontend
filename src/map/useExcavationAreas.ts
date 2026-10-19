import { useEffect } from 'react'
import type { MutableRefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { MAP_STYLE_LOAD_EVENT } from 'map/mapLayers'
import { observeExcavationAvailability } from 'map/mapExcavationAvailability'
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

function useExcavationAreaLifecycle(
  mapRef: MutableRefObject<MapLibreMap | null>,
  onAvailabilityChange?: (isUnavailable: boolean) => void,
): void {
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const isCurrentMap = (): boolean => mapRef.current === map
    const install = (): void => addExcavationAreas(map)

    const stopObservingAvailability = observeExcavationAvailability(
      map,
      EXCAVATION_AREA_LAYER_IDS,
      onAvailabilityChange,
    )
    map.on(MAP_STYLE_LOAD_EVENT, install)
    if (map.getStyle()) install()

    return () => {
      if (!isCurrentMap()) return
      stopObservingAvailability()
      map.off(MAP_STYLE_LOAD_EVENT, install)
      removeExcavationAreas(map)
    }
  }, [mapRef, onAvailabilityChange])
}

function useExcavationAreaVisibility(
  mapRef: MutableRefObject<MapLibreMap | null>,
  isVisible: boolean,
): void {
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const isCurrentMap = (): boolean => mapRef.current === map
    const updateVisibility = (): void =>
      setExcavationAreasVisible(map, isVisible)

    map.on(MAP_STYLE_LOAD_EVENT, updateVisibility)
    updateVisibility()

    return () => {
      if (isCurrentMap()) map.off(MAP_STYLE_LOAD_EVENT, updateVisibility)
    }
  }, [mapRef, isVisible])
}

export default function useExcavationAreas(
  mapRef: MutableRefObject<MapLibreMap | null>,
  isVisible: boolean,
  onAvailabilityChange?: (isUnavailable: boolean) => void,
): void {
  useExcavationAreaLifecycle(mapRef, onAvailabilityChange)
  useExcavationAreaVisibility(mapRef, isVisible)
}
