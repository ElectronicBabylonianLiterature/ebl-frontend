import { useEffect, useRef, type MutableRefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import {
  applyExcavationAreaSelection,
  applyExcavationAreaVisualization,
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

export function useExcavationAreaVisibility(
  mapRef: MutableRefObject<MapLibreMap | null>,
  isVisible: boolean,
): void {
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const update = (): void => setExcavationAreasVisible(map, isVisible)
    if (map.isStyleLoaded()) update()
    else map.once('load', update)
    return () => {
      if (ownsMap(mapRef, map)) map.off('load', update)
    }
  }, [mapRef, isVisible])
}

export function useExcavationAreaSelection(
  mapRef: MutableRefObject<MapLibreMap | null>,
  isVisible: boolean,
  selectedPolygonId: string | null,
): void {
  const previousSelectedIdRef = useRef<string | null>(null)
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const update = (): void => {
      const nextId = isVisible ? selectedPolygonId : null
      applyExcavationAreaSelection(map, previousSelectedIdRef.current, nextId)
      previousSelectedIdRef.current = nextId
    }
    if (map.isStyleLoaded()) update()
    else map.once('load', update)
    return () => {
      if (ownsMap(mapRef, map)) map.off('load', update)
    }
  }, [mapRef, isVisible, selectedPolygonId])
}

export function useExcavationAreaVisualization(
  mapRef: MutableRefObject<MapLibreMap | null>,
  paint: ExcavationPaint | undefined,
  values: PolygonVisualizationValues | undefined,
): void {
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const update = (): void =>
      applyExcavationAreaVisualization(
        map,
        paint ?? CATEGORICAL_PAINT,
        values ?? EMPTY_VALUES,
      )
    if (map.isStyleLoaded()) update()
    else map.once('load', update)
    return () => {
      if (ownsMap(mapRef, map)) map.off('load', update)
    }
  }, [mapRef, paint, values])
}
