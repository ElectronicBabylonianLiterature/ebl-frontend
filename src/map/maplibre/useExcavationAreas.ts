import { useEffect } from 'react'
import type { MutableRefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import {
  MAP_STYLE_LOAD_EVENT,
  clusterLayer,
  clusterCountLayer,
  unclusteredLayer,
} from 'map/maplibre/mapLayers'
import type { ExcavationPolygonIndex } from 'map/domain/excavationPolygonIndex'
import { observeExcavationAvailability } from 'map/maplibre/mapExcavationAvailability'
import {
  EXCAVATION_AREAS_SOURCE_ID,
  EXCAVATION_AREA_LAYER_IDS,
  createExcavationAreasSource,
  excavationAreaFillLayer,
  excavationAreaOutlineLayer,
} from 'map/maplibre/mapExcavationLayers'

function addExcavationAreas(
  map: MapLibreMap,
  polygonIndex: ExcavationPolygonIndex,
): void {
  if (!map.getSource(EXCAVATION_AREAS_SOURCE_ID)) {
    map.addSource(
      EXCAVATION_AREAS_SOURCE_ID,
      createExcavationAreasSource(polygonIndex),
    )
  }
  let beforeId = [clusterLayer, clusterCountLayer, unclusteredLayer].find(
    (layer) => map.getLayer(layer.id),
  )?.id
  ;[excavationAreaOutlineLayer, excavationAreaFillLayer].forEach((layer) => {
    if (!map.getLayer(layer.id)) map.addLayer(layer, beforeId)
    beforeId = layer.id
  })
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
  polygonIndex: ExcavationPolygonIndex | null,
  onAvailabilityChange?: (isUnavailable: boolean) => void,
): void {
  useEffect(() => {
    const map = mapRef.current
    if (!map || polygonIndex === null) return

    let isActive = true
    const ownsMap = (): boolean => mapRef.current === map
    const isCurrentMap = (): boolean => isActive && ownsMap()
    const install = (): void => {
      if (isCurrentMap()) addExcavationAreas(map, polygonIndex)
    }

    const stopObservingAvailability = observeExcavationAvailability(
      map,
      EXCAVATION_AREA_LAYER_IDS,
      onAvailabilityChange,
      isCurrentMap,
    )
    map.on(MAP_STYLE_LOAD_EVENT, install)
    if (map.getStyle()) install()

    return () => {
      isActive = false
      stopObservingAvailability()
      map.off(MAP_STYLE_LOAD_EVENT, install)
      if (ownsMap()) removeExcavationAreas(map)
    }
  }, [mapRef, onAvailabilityChange, polygonIndex])
}

function useExcavationAreaVisibility(
  mapRef: MutableRefObject<MapLibreMap | null>,
  isVisible: boolean,
  polygonIndex: ExcavationPolygonIndex | null,
): void {
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    let isActive = true
    const updateVisibility = (): void => {
      if (isActive && mapRef.current === map)
        setExcavationAreasVisible(map, isVisible)
    }

    map.on(MAP_STYLE_LOAD_EVENT, updateVisibility)
    updateVisibility()

    return () => {
      isActive = false
      map.off(MAP_STYLE_LOAD_EVENT, updateVisibility)
    }
  }, [mapRef, isVisible, polygonIndex])
}

export default function useExcavationAreas(
  mapRef: MutableRefObject<MapLibreMap | null>,
  isVisible: boolean,
  onAvailabilityChange: ((isUnavailable: boolean) => void) | undefined,
  polygonIndex: ExcavationPolygonIndex | null,
): void {
  useExcavationAreaLifecycle(mapRef, polygonIndex, onAvailabilityChange)
  useExcavationAreaVisibility(mapRef, isVisible, polygonIndex)
}
