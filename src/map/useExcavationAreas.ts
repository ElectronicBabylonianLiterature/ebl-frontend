import { useEffect, useRef } from 'react'
import type { MutableRefObject } from 'react'
import type { Map as MapLibreMap, MapMouseEvent } from 'maplibre-gl'
import { MAP_STYLE_LOAD_EVENT } from 'map/mapLayers'
import { observeExcavationAvailability } from 'map/mapExcavationAvailability'
import {
  EXCAVATION_AREAS_SOURCE_ID,
  EXCAVATION_AREA_FILL_LAYER_ID,
} from 'map/mapLayerIds'
import {
  ALL_EXCAVATION_AREA_LAYER_IDS,
  addExcavationAreas,
  removeExcavationAreas,
  setExcavationAreasVisible,
} from 'map/mapExcavationResources'
import { applyExcavationPaint } from 'map/mapChoroplethLayers'
import { CATEGORICAL_PAINT, type ExcavationPaint } from 'map/mapExcavationPaint'
import type { PolygonVisualizationValues } from 'map/mapVisualizationValues'
import {
  applySelection,
  applyVisualizationValues,
} from 'map/mapExcavationFeatureState'

const EMPTY_VALUES: PolygonVisualizationValues = new Map()

function ownsMap(
  mapRef: MutableRefObject<MapLibreMap | null>,
  map: MapLibreMap,
): boolean {
  return mapRef.current === map
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
      ALL_EXCAVATION_AREA_LAYER_IDS,
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

    const updateVisibility = (): void =>
      setExcavationAreasVisible(map, isVisible)
    map.on(MAP_STYLE_LOAD_EVENT, updateVisibility)
    updateVisibility()

    return () => {
      if (ownsMap(mapRef, map)) map.off(MAP_STYLE_LOAD_EVENT, updateVisibility)
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
      if (ownsMap(mapRef, map)) map.off(MAP_STYLE_LOAD_EVENT, updateSelection)
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
      if (ownsMap(mapRef, map)) map.off(MAP_STYLE_LOAD_EVENT, updatePaint)
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
      if (ownsMap(mapRef, map)) map.off(MAP_STYLE_LOAD_EVENT, updateValues)
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
