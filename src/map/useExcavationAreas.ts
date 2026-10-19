import { useEffect, useRef } from 'react'
import type { MutableRefObject } from 'react'
import type { Map as MapLibreMap, MapMouseEvent } from 'maplibre-gl'
import { MAP_STYLE_LOAD_EVENT } from 'map/mapLayers'
import { observeExcavationAvailability } from 'map/mapExcavationAvailability'
import {
  EXCAVATION_AREAS_SOURCE_ID,
  EXCAVATION_AREA_FILL_LAYER_ID,
  EXCAVATION_AREA_OUTLINE_LAYER_ID,
  EXCAVATION_AREA_SELECTED_LAYER_ID,
} from 'map/mapLayerIds'
import {
  createExcavationAreasSource,
  excavationAreaFillLayer,
  excavationAreaOutlineLayer,
  excavationAreaSelectedLayer,
} from 'map/mapExcavationLayers'
import { applyExcavationPaint } from 'map/mapChoroplethLayers'
import { CATEGORICAL_PAINT, type ExcavationPaint } from 'map/mapExcavationPaint'
import {
  featureStateFor,
  type PolygonVisualizationValues,
} from 'map/mapVisualizationValues'

const ALL_LAYER_IDS: readonly string[] = [
  EXCAVATION_AREA_FILL_LAYER_ID,
  EXCAVATION_AREA_OUTLINE_LAYER_ID,
  EXCAVATION_AREA_SELECTED_LAYER_ID,
]
const EMPTY_VALUES: PolygonVisualizationValues = new Map()

function addExcavationAreas(map: MapLibreMap): void {
  if (!map.getSource(EXCAVATION_AREAS_SOURCE_ID)) {
    map.addSource(EXCAVATION_AREAS_SOURCE_ID, createExcavationAreasSource())
  }
  ;[
    excavationAreaFillLayer,
    excavationAreaOutlineLayer,
    excavationAreaSelectedLayer,
  ].forEach((layer) => {
    if (!map.getLayer(layer.id)) map.addLayer(layer)
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

function applySelection(
  map: MapLibreMap,
  previousId: string | null,
  nextId: string | null,
): void {
  if (previousId && previousId !== nextId) {
    map.setFeatureState(
      { source: EXCAVATION_AREAS_SOURCE_ID, id: previousId },
      { selected: false },
    )
  }
  if (nextId) {
    map.setFeatureState(
      { source: EXCAVATION_AREAS_SOURCE_ID, id: nextId },
      { selected: true },
    )
  }
}

function applyVisualizationValues(
  map: MapLibreMap,
  values: PolygonVisualizationValues,
): void {
  values.forEach((value, polygonId) => {
    map.setFeatureState(
      { source: EXCAVATION_AREAS_SOURCE_ID, id: polygonId },
      featureStateFor(value),
    )
  })
}

export interface ExcavationAreaOptions {
  readonly isVisible: boolean
  readonly selectedPolygonId: string | null
  readonly paint?: ExcavationPaint
  readonly values?: PolygonVisualizationValues
  readonly onSelectPolygon: (polygonId: string) => void
  readonly onAvailabilityChange?: (isUnavailable: boolean) => void
}

function useExcavationAreaLifecycle(
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

    const handleClick = (event: MapMouseEvent): void => {
      const [feature] = map.queryRenderedFeatures(event.point, {
        layers: [EXCAVATION_AREA_FILL_LAYER_ID],
      })
      if (typeof feature?.id === 'string') {
        latestOptionsRef.current.onSelectPolygon(feature.id)
      }
    }

    const stopObservingAvailability = observeExcavationAvailability(
      map,
      ALL_LAYER_IDS,
      (unavailable) =>
        latestOptionsRef.current.onAvailabilityChange?.(unavailable),
    )
    map.on('click', EXCAVATION_AREA_FILL_LAYER_ID, handleClick)
    map.on(MAP_STYLE_LOAD_EVENT, install)
    if (map.getStyle()) install()

    return () => {
      if (!isCurrentMap()) return
      stopObservingAvailability()
      map.off(MAP_STYLE_LOAD_EVENT, install)
      map.off('click', EXCAVATION_AREA_FILL_LAYER_ID, handleClick)
      removeExcavationAreas(map)
    }
  }, [mapRef])
}

function useExcavationAreaVisibility(
  mapRef: MutableRefObject<MapLibreMap | null>,
  isVisible: boolean,
): void {
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const updateVisibility = (): void => setVisible(map, isVisible)
    map.on(MAP_STYLE_LOAD_EVENT, updateVisibility)
    updateVisibility()

    return () => {
      if (mapRef.current === map)
        map.off(MAP_STYLE_LOAD_EVENT, updateVisibility)
    }
  }, [mapRef, isVisible])
}

function useExcavationAreaSelection(
  mapRef: MutableRefObject<MapLibreMap | null>,
  isVisible: boolean,
  selectedPolygonId: string | null,
): void {
  const previousSelectedIdRef = useRef<string | null>(null)

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const updateSelection = (): void => {
      if (!map.getSource(EXCAVATION_AREAS_SOURCE_ID)) return
      const nextId = isVisible ? selectedPolygonId : null
      applySelection(map, previousSelectedIdRef.current, nextId)
      previousSelectedIdRef.current = nextId
    }
    map.on(MAP_STYLE_LOAD_EVENT, updateSelection)
    updateSelection()

    return () => {
      if (mapRef.current === map) map.off(MAP_STYLE_LOAD_EVENT, updateSelection)
    }
  }, [mapRef, isVisible, selectedPolygonId])
}

function useExcavationAreaVisualization(
  mapRef: MutableRefObject<MapLibreMap | null>,
  paint: ExcavationPaint | undefined,
  values: PolygonVisualizationValues | undefined,
): void {
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const updatePaint = (): void =>
      applyExcavationPaint(map, paint ?? CATEGORICAL_PAINT)
    map.on(MAP_STYLE_LOAD_EVENT, updatePaint)
    updatePaint()

    return () => {
      if (mapRef.current === map) map.off(MAP_STYLE_LOAD_EVENT, updatePaint)
    }
  }, [mapRef, paint])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const updateValues = (): void => {
      if (map.getSource(EXCAVATION_AREAS_SOURCE_ID)) {
        applyVisualizationValues(map, values ?? EMPTY_VALUES)
      }
    }
    map.on(MAP_STYLE_LOAD_EVENT, updateValues)
    updateValues()

    return () => {
      if (mapRef.current === map) map.off(MAP_STYLE_LOAD_EVENT, updateValues)
    }
  }, [mapRef, values])
}

export default function useExcavationAreas(
  mapRef: MutableRefObject<MapLibreMap | null>,
  options: ExcavationAreaOptions,
): void {
  useExcavationAreaLifecycle(mapRef, options)
  useExcavationAreaVisibility(mapRef, options.isVisible)
  useExcavationAreaSelection(
    mapRef,
    options.isVisible,
    options.selectedPolygonId,
  )
  useExcavationAreaVisualization(mapRef, options.paint, options.values)
}
