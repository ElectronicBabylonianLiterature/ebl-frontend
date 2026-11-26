import { useEffect, useRef } from 'react'
import type { MutableRefObject } from 'react'
import type { Map as MapLibreMap, MapMouseEvent } from 'maplibre-gl'
import { MAP_STYLE_LOAD_EVENT } from 'map/maplibre/mapLayers'
import type { ExcavationPolygonIndex } from 'map/domain/excavationPolygonIndex'
import { observeExcavationAvailability } from 'map/maplibre/mapExcavationAvailability'
import {
  EXCAVATION_AREAS_SOURCE_ID,
  EXCAVATION_AREA_FILL_LAYER_ID,
} from 'map/domain/mapLayerIds'
import {
  ALL_EXCAVATION_AREA_LAYER_IDS,
  addExcavationAreas,
  removeExcavationAreas,
  setExcavationAreasVisible,
} from 'map/maplibre/mapExcavationResources'
import { type ExcavationPaint } from 'map/maplibre/mapExcavationPaint'
import type { PolygonVisualizationValues } from 'map/domain/mapVisualizationValues'
import { applySelection } from 'map/maplibre/mapExcavationFeatureState'

import useExcavationAreaVisualization from 'map/maplibre/useExcavationAreaVisualization'

export interface ExcavationAreaOptions {
  readonly polygonIndex: ExcavationPolygonIndex | null
  readonly isVisible: boolean
  readonly selectedPolygonId: string | null
  readonly paint?: ExcavationPaint
  readonly values?: PolygonVisualizationValues
  readonly onSelectPolygon?: (polygonId: string) => void
  readonly retryVersion?: number
  readonly onAvailabilityChange?: (isUnavailable: boolean) => void
  readonly isInteractionEnabled?: boolean
}

function observeExcavationClicks(
  map: MapLibreMap,
  getOptions: () => ExcavationAreaOptions,
  isCurrentMap: () => boolean,
): () => void {
  const handleClick = (event: MapMouseEvent): void => {
    if (
      !isCurrentMap() ||
      !getOptions().isVisible ||
      !getOptions().onSelectPolygon ||
      getOptions().isInteractionEnabled === false
    )
      return
    const [feature] = map.queryRenderedFeatures(event.point, {
      layers: [EXCAVATION_AREA_FILL_LAYER_ID],
    })
    if (typeof feature?.id === 'string') {
      getOptions().onSelectPolygon?.(feature.id)
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
  const retryVersion = options.retryVersion ?? 0
  const latestOptionsRef = useRef(options)
  latestOptionsRef.current = options

  useEffect(() => {
    const map = mapRef.current
    if (!map || polygonIndex === null) return

    let isActive = true
    const ownsMap = (): boolean => mapRef.current === map
    const isCurrentMap = (): boolean => isActive && ownsMap()
    const install = (): void => {
      if (!isCurrentMap()) return
      try {
        addExcavationAreas(map, polygonIndex)
      } catch {
        latestOptionsRef.current.onAvailabilityChange?.(true)
      }
    }

    const stopObservingClicks = observeExcavationClicks(
      map,
      () => latestOptionsRef.current,
      isCurrentMap,
    )

    const stopObservingAvailability = observeExcavationAvailability(
      map,
      ALL_EXCAVATION_AREA_LAYER_IDS,
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
      if (ownsMap() && map.getStyle()) removeExcavationAreas(map)
    }
  }, [mapRef, polygonIndex, retryVersion])
}

function useExcavationAreaVisibility(
  mapRef: MutableRefObject<MapLibreMap | null>,
  isVisible: boolean,
  polygonIndex: ExcavationPolygonIndex | null,
  retryVersion: number,
): void {
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    let isActive = true
    const updateVisibility = (): void => {
      if (isActive && mapRef.current === map && map.getStyle())
        setExcavationAreasVisible(map, isVisible)
    }
    map.on(MAP_STYLE_LOAD_EVENT, updateVisibility)
    updateVisibility()

    return () => {
      isActive = false
      map.off(MAP_STYLE_LOAD_EVENT, updateVisibility)
    }
  }, [mapRef, isVisible, polygonIndex, retryVersion])
}

function useExcavationAreaSelection(
  mapRef: MutableRefObject<MapLibreMap | null>,
  isVisible: boolean,
  selectedPolygonId: string | null,
  polygonIndex: ExcavationPolygonIndex | null,
  retryVersion: number,
): void {
  const previousSelectedIdRef = useRef<string | null>(null)

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    let isActive = true
    const updateSelection = (): void => {
      if (
        !isActive ||
        mapRef.current !== map ||
        !map.getStyle() ||
        !map.getSource(EXCAVATION_AREAS_SOURCE_ID)
      )
        return
      const nextId = isVisible ? selectedPolygonId : null
      applySelection(map, previousSelectedIdRef.current, nextId)
      previousSelectedIdRef.current = nextId
    }
    map.on(MAP_STYLE_LOAD_EVENT, updateSelection)
    updateSelection()

    return () => {
      isActive = false
      map.off(MAP_STYLE_LOAD_EVENT, updateSelection)
    }
  }, [mapRef, isVisible, selectedPolygonId, polygonIndex, retryVersion])
}

export default function useExcavationAreas(
  mapRef: MutableRefObject<MapLibreMap | null>,
  options: ExcavationAreaOptions,
): void {
  useExcavationAreaLifecycle(mapRef, options)
  useExcavationAreaVisibility(
    mapRef,
    options.isVisible,
    options.polygonIndex,
    options.retryVersion ?? 0,
  )
  useExcavationAreaSelection(
    mapRef,
    options.isVisible,
    options.selectedPolygonId,
    options.polygonIndex,
    options.retryVersion ?? 0,
  )
  useExcavationAreaVisualization(
    mapRef,
    options.paint,
    options.values,
    options.polygonIndex,
    options.retryVersion ?? 0,
  )
}
