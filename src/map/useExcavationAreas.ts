import { useEffect, useRef } from 'react'
import type { MutableRefObject } from 'react'
import type { Map as MapLibreMap, MapMouseEvent } from 'maplibre-gl'
import type { MapLibreErrorEvent } from 'map/mapBackgroundError'
import { EXCAVATION_AREA_FILL_LAYER_ID } from 'map/mapLayerIds'
import {
  addExcavationAreas,
  applyExcavationAreaSelection,
  applyExcavationAreaVisualization,
  isExcavationAreaError,
  removeExcavationAreas,
  setExcavationAreasVisible,
} from 'map/excavationAreaMap'
import { CATEGORICAL_PAINT, type ExcavationPaint } from 'map/mapExcavationPaint'
import type { PolygonVisualizationValues } from 'map/mapVisualizationValues'

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
    const handleError = (event: MapLibreErrorEvent): void => {
      if (isExcavationAreaError(event)) {
        latestOptionsRef.current.onAvailabilityChange?.(true)
      }
    }
    const handleClick = (event: MapMouseEvent): void => {
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

function useExcavationAreaVisibility(
  mapRef: MutableRefObject<MapLibreMap | null>,
  isVisible: boolean,
): void {
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const updateVisibility = (): void =>
      setExcavationAreasVisible(map, isVisible)
    if (map.isStyleLoaded()) updateVisibility()
    else map.once('load', updateVisibility)

    return () => {
      if (ownsMap(mapRef, map)) map.off('load', updateVisibility)
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
      const nextId = isVisible ? selectedPolygonId : null
      applyExcavationAreaSelection(map, previousSelectedIdRef.current, nextId)
      previousSelectedIdRef.current = nextId
    }
    if (map.isStyleLoaded()) updateSelection()
    else map.once('load', updateSelection)

    return () => {
      if (ownsMap(mapRef, map)) map.off('load', updateSelection)
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
      applyExcavationAreaVisualization(
        map,
        paint ?? CATEGORICAL_PAINT,
        EMPTY_VALUES,
      )
    if (map.isStyleLoaded()) updatePaint()
    else map.once('load', updatePaint)

    return () => {
      if (ownsMap(mapRef, map)) map.off('load', updatePaint)
    }
  }, [mapRef, paint])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const updateValues = (): void =>
      applyExcavationAreaVisualization(
        map,
        paint ?? CATEGORICAL_PAINT,
        values ?? EMPTY_VALUES,
      )
    if (map.isStyleLoaded()) updateValues()
    else map.once('load', updateValues)

    return () => {
      if (ownsMap(mapRef, map)) map.off('load', updateValues)
    }
  }, [mapRef, paint, values])
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
