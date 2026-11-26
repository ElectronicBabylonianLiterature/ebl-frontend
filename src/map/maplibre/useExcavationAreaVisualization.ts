import { useEffect } from 'react'
import type { MutableRefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import type { ExcavationPolygonIndex } from 'map/domain/excavationPolygonIndex'
import { MAP_STYLE_LOAD_EVENT } from 'map/maplibre/mapLayers'
import { EXCAVATION_AREAS_SOURCE_ID } from 'map/domain/mapLayerIds'
import { applyExcavationPaint } from 'map/domain/mapChoroplethLayers'
import {
  CATEGORICAL_PAINT,
  type ExcavationPaint,
} from 'map/maplibre/mapExcavationPaint'
import type { PolygonVisualizationValues } from 'map/domain/mapVisualizationValues'
import { applyVisualizationValues } from 'map/maplibre/mapExcavationFeatureState'

const EMPTY_VALUES: PolygonVisualizationValues = new Map()

export default function useExcavationAreaVisualization(
  mapRef: MutableRefObject<MapLibreMap | null>,
  paint: ExcavationPaint | undefined,
  values: PolygonVisualizationValues | undefined,
  polygonIndex: ExcavationPolygonIndex | null,
  retryVersion: number,
): void {
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    let isActive = true
    const updatePaint = (): void => {
      if (isActive && mapRef.current === map && map.getStyle())
        applyExcavationPaint(map, paint ?? CATEGORICAL_PAINT)
    }
    map.on(MAP_STYLE_LOAD_EVENT, updatePaint)
    updatePaint()

    return () => {
      isActive = false
      map.off(MAP_STYLE_LOAD_EVENT, updatePaint)
    }
  }, [mapRef, paint, polygonIndex, retryVersion])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    let isActive = true
    const updateValues = (): void => {
      if (
        isActive &&
        mapRef.current === map &&
        map.getStyle() &&
        map.getSource(EXCAVATION_AREAS_SOURCE_ID)
      ) {
        applyVisualizationValues(map, values ?? EMPTY_VALUES)
      }
    }
    map.on(MAP_STYLE_LOAD_EVENT, updateValues)
    updateValues()

    return () => {
      isActive = false
      map.off(MAP_STYLE_LOAD_EVENT, updateValues)
    }
  }, [mapRef, values, polygonIndex, retryVersion])
}
