import { useEffect } from 'react'
import type { MutableRefObject } from 'react'
import type { ExpressionSpecification, Map as MapLibreMap } from 'maplibre-gl'
import type { ExcavationPolygonIndex } from 'map/domain/excavationPolygonIndex'
import { MAP_STYLE_LOAD_EVENT, unclusteredLayer } from 'map/maplibre/mapLayers'
import {
  EXCAVATION_AREA_FILL_LAYER_ID,
  EXCAVATION_AREA_OUTLINE_LAYER_ID,
} from 'map/maplibre/mapExcavationLayers'

function selectedValue(
  id: string | null,
  selected: number,
  normal: number,
): ExpressionSpecification | number {
  return id === null
    ? normal
    : ['case', ['==', ['get', 'id'], id], selected, normal]
}

export default function useMapFeatureSelection(
  mapRef: MutableRefObject<MapLibreMap | null>,
  selectedFindspotId: string | null,
  selectedPolygonId: string | null,
  polygonIndex?: ExcavationPolygonIndex,
  retryVersion = 0,
): void {
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    let isActive = true
    const update = (): void => {
      if (!isActive || mapRef.current !== map) return
      if (map.getLayer(unclusteredLayer.id)) {
        map.setPaintProperty(
          unclusteredLayer.id,
          'circle-radius',
          selectedValue(selectedFindspotId, 12, 8),
        )
        map.setPaintProperty(
          unclusteredLayer.id,
          'circle-stroke-width',
          selectedValue(selectedFindspotId, 4, 2),
        )
      }
      if (map.getLayer(EXCAVATION_AREA_FILL_LAYER_ID)) {
        map.setPaintProperty(
          EXCAVATION_AREA_FILL_LAYER_ID,
          'fill-opacity',
          selectedValue(selectedPolygonId, 0.45, 0.2),
        )
      }
      if (map.getLayer(EXCAVATION_AREA_OUTLINE_LAYER_ID)) {
        map.setPaintProperty(
          EXCAVATION_AREA_OUTLINE_LAYER_ID,
          'line-width',
          selectedValue(selectedPolygonId, 3.5, 1.75),
        )
      }
    }
    map.on(MAP_STYLE_LOAD_EVENT, update)
    update()
    return () => {
      isActive = false
      map.off(MAP_STYLE_LOAD_EVENT, update)
    }
  }, [
    mapRef,
    selectedFindspotId,
    selectedPolygonId,
    polygonIndex,
    retryVersion,
  ])
}
