import { useEffect, useRef, type MutableRefObject } from 'react'
import { MAP_STYLE_LOAD_EVENT } from 'map/mapLayers'
import type { Map as MapLibreMap } from 'maplibre-gl'
import {
  applyExcavationAreaSelection,
  applyExcavationAreaVisualization,
  setExcavationAreasVisible,
} from 'map/excavationAreaMap'
import { CATEGORICAL_PAINT, type ExcavationPaint } from 'map/mapExcavationPaint'
import type { PolygonVisualizationValues } from 'map/mapVisualizationValues'

const EMPTY_VALUES: PolygonVisualizationValues = new Map()

function subscribeMapUpdate(
  mapRef: MutableRefObject<MapLibreMap | null>,
  update: (map: MapLibreMap) => void,
): (() => void) | undefined {
  const map = mapRef.current
  if (!map) return
  let isActive = true
  const updateCurrentMap = (): void => {
    if (isActive && mapRef.current === map) update(map)
  }
  map.on(MAP_STYLE_LOAD_EVENT, updateCurrentMap)
  if (map.getStyle()) updateCurrentMap()
  return () => {
    isActive = false
    map.off(MAP_STYLE_LOAD_EVENT, updateCurrentMap)
  }
}

export function useExcavationAreaVisibility(
  mapRef: MutableRefObject<MapLibreMap | null>,
  isVisible: boolean,
): void {
  useEffect(
    () =>
      subscribeMapUpdate(mapRef, (map) =>
        setExcavationAreasVisible(map, isVisible),
      ),
    [mapRef, isVisible],
  )
}

export function useExcavationAreaSelection(
  mapRef: MutableRefObject<MapLibreMap | null>,
  isVisible: boolean,
  selectedPolygonId: string | null,
): void {
  const previousSelectedIdRef = useRef<string | null>(null)
  useEffect(
    () =>
      subscribeMapUpdate(mapRef, (map) => {
        const nextId = isVisible ? selectedPolygonId : null
        applyExcavationAreaSelection(map, previousSelectedIdRef.current, nextId)
        previousSelectedIdRef.current = nextId
      }),
    [mapRef, isVisible, selectedPolygonId],
  )
}

export function useExcavationAreaVisualization(
  mapRef: MutableRefObject<MapLibreMap | null>,
  paint: ExcavationPaint | undefined,
  values: PolygonVisualizationValues | undefined,
): void {
  useEffect(
    () =>
      subscribeMapUpdate(mapRef, (map) =>
        applyExcavationAreaVisualization(
          map,
          paint ?? CATEGORICAL_PAINT,
          values ?? EMPTY_VALUES,
        ),
      ),
    [mapRef, paint, values],
  )
}
