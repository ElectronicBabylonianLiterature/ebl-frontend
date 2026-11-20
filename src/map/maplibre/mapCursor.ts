import type { Map as MapLibreMap, MapMouseEvent } from 'maplibre-gl'
import { clusterLayer, unclusteredLayer } from 'map/maplibre/mapLayers'
import { queryFindspotFeatures } from 'map/maplibre/mapFeatureQuery'
import { EXCAVATION_AREA_FILL_LAYER_ID } from 'map/maplibre/mapExcavationLayers'

export const INTERACTIVE_LAYER_IDS = [
  clusterLayer.id,
  unclusteredLayer.id,
  EXCAVATION_AREA_FILL_LAYER_ID,
] as const

export function setCanvasCursor(map: MapLibreMap, cursor: string): void {
  map.getCanvas().style.cursor = cursor
}

export function setPointerCursor(map: MapLibreMap, event: MapMouseEvent): void {
  const layerIds = INTERACTIVE_LAYER_IDS.filter((id) => map.getLayer(id))
  const isOverFeature =
    layerIds.length > 0 &&
    queryFindspotFeatures(map, event.point, layerIds).length > 0
  setCanvasCursor(map, isOverFeature ? 'pointer' : '')
}

export function showPointerCursor(map: MapLibreMap): void {
  setCanvasCursor(map, 'pointer')
}

export function resetPointerCursor(map: MapLibreMap): void {
  setCanvasCursor(map, '')
}
