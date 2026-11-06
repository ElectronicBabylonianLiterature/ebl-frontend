import { useEffect, useRef } from 'react'
import type { MutableRefObject } from 'react'
import type { Map as MapLibreMap, MapMouseEvent } from 'maplibre-gl'
import {
  MAP_STYLE_LOAD_EVENT,
  clusterLayer,
  clusterCountLayer,
  unclusteredLayer,
} from 'map/mapLayers'
import type { ExcavationPolygonIndex } from 'map/excavationPolygonIndex'
import { observeExcavationAvailability } from 'map/mapExcavationAvailability'
import {
  EXCAVATION_AREAS_SOURCE_ID,
  EXCAVATION_AREA_FILL_LAYER_ID,
  EXCAVATION_AREA_LAYER_IDS,
  EXCAVATION_AREA_SELECTED_LAYER_ID,
  createExcavationAreasSource,
  excavationAreaFillLayer,
  excavationAreaOutlineLayer,
  excavationAreaSelectedLayer,
} from 'map/mapExcavationLayers'

const ALL_LAYER_IDS: readonly string[] = [
  ...EXCAVATION_AREA_LAYER_IDS,
  EXCAVATION_AREA_SELECTED_LAYER_ID,
]

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
  ;[
    excavationAreaSelectedLayer,
    excavationAreaOutlineLayer,
    excavationAreaFillLayer,
  ].forEach((layer) => {
    if (!map.getLayer(layer.id)) map.addLayer(layer, beforeId)
    beforeId = layer.id
  })
}

function removeExcavationAreas(map: MapLibreMap): void {
  ;[...ALL_LAYER_IDS].reverse().forEach((layerId) => {
    if (map.getLayer(layerId)) map.removeLayer(layerId)
  })
  if (map.getSource(EXCAVATION_AREAS_SOURCE_ID)) {
    map.removeSource(EXCAVATION_AREAS_SOURCE_ID)
  }
}

function setVisible(map: MapLibreMap, isVisible: boolean): void {
  ALL_LAYER_IDS.forEach((layerId) => {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(
        layerId,
        'visibility',
        isVisible ? 'visible' : 'none',
      )
    }
  })
}

function applySelectedState(
  map: MapLibreMap,
  selectedPolygonId: string | null,
): void {
  if (!map.getLayer(EXCAVATION_AREA_SELECTED_LAYER_ID)) return
  map.setPaintProperty(
    EXCAVATION_AREA_SELECTED_LAYER_ID,
    'line-opacity',
    selectedPolygonId === null
      ? 0
      : ['case', ['==', ['get', 'id'], selectedPolygonId], 0.9, 0],
  )
}

export interface ExcavationAreaOptions {
  readonly polygonIndex: ExcavationPolygonIndex | null
  readonly isVisible: boolean
  readonly selectedPolygonId: string | null
  readonly onSelectPolygon: (polygonId: string) => void
  readonly onAvailabilityChange?: (isUnavailable: boolean) => void
}

function observeExcavationClicks(
  map: MapLibreMap,
  getOptions: () => ExcavationAreaOptions,
  isCurrentMap: () => boolean,
): () => void {
  const handleClick = (event: MapMouseEvent): void => {
    if (!isCurrentMap()) return
    const [feature] = map.queryRenderedFeatures(event.point, {
      layers: [EXCAVATION_AREA_FILL_LAYER_ID],
    })
    if (typeof feature?.id === 'string') {
      getOptions().onSelectPolygon(feature.id)
    }
  }
  map.on('click', EXCAVATION_AREA_FILL_LAYER_ID, handleClick)
  return () => map.off('click', EXCAVATION_AREA_FILL_LAYER_ID, handleClick)
}

function useExcavationAreaLifecycle(
  mapRef: MutableRefObject<MapLibreMap | null>,
  options: ExcavationAreaOptions,
): void {
  const polygonIndex = options.polygonIndex
  const latestOptionsRef = useRef(options)
  latestOptionsRef.current = options

  useEffect(() => {
    const map = mapRef.current
    if (!map || polygonIndex === null) return

    let isActive = true
    const ownsMap = (): boolean => mapRef.current === map
    const isCurrentMap = (): boolean => isActive && ownsMap()
    const install = (): void => {
      if (isCurrentMap()) addExcavationAreas(map, polygonIndex)
    }

    const stopObservingClicks = observeExcavationClicks(
      map,
      () => latestOptionsRef.current,
      isCurrentMap,
    )

    const stopObservingAvailability = observeExcavationAvailability(
      map,
      ALL_LAYER_IDS,
      (unavailable) =>
        latestOptionsRef.current.onAvailabilityChange?.(unavailable),
      isCurrentMap,
    )
    map.on(MAP_STYLE_LOAD_EVENT, install)
    if (map.getStyle()) install()

    return () => {
      isActive = false
      stopObservingAvailability()
      map.off(MAP_STYLE_LOAD_EVENT, install)
      stopObservingClicks()
      if (ownsMap()) removeExcavationAreas(map)
    }
  }, [mapRef, polygonIndex])
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
      if (isActive && mapRef.current === map) setVisible(map, isVisible)
    }

    map.on(MAP_STYLE_LOAD_EVENT, updateVisibility)
    updateVisibility()

    return () => {
      isActive = false
      map.off(MAP_STYLE_LOAD_EVENT, updateVisibility)
    }
  }, [mapRef, isVisible, polygonIndex])
}

function useExcavationAreaSelection(
  mapRef: MutableRefObject<MapLibreMap | null>,
  isVisible: boolean,
  selectedPolygonId: string | null,
  polygonIndex: ExcavationPolygonIndex | null,
): void {
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    let isActive = true
    const updateSelection = (): void => {
      if (isActive && mapRef.current === map)
        applySelectedState(map, isVisible ? selectedPolygonId : null)
    }
    map.on(MAP_STYLE_LOAD_EVENT, updateSelection)
    updateSelection()

    return () => {
      isActive = false
      map.off(MAP_STYLE_LOAD_EVENT, updateSelection)
    }
  }, [mapRef, isVisible, selectedPolygonId, polygonIndex])
}

export default function useExcavationAreas(
  mapRef: MutableRefObject<MapLibreMap | null>,
  options: ExcavationAreaOptions,
): void {
  useExcavationAreaLifecycle(mapRef, options)
  useExcavationAreaVisibility(mapRef, options.isVisible, options.polygonIndex)
  useExcavationAreaSelection(
    mapRef,
    options.isVisible,
    options.selectedPolygonId,
    options.polygonIndex,
  )
}
