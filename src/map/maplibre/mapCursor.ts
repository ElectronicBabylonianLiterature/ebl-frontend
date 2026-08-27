import type { Map as MapLibreMap, MapMouseEvent } from 'maplibre-gl'
import { clusterLayer, unclusteredLayer } from 'map/maplibre/mapLayers'
import { queryFindspotFeatures } from 'map/maplibre/mapFeatureQuery'

export const INTERACTIVE_LAYER_IDS = [
  clusterLayer.id,
  unclusteredLayer.id,
] as const

export function setCanvasCursor(map: MapLibreMap, cursor: string): void {
  map.getCanvas().style.cursor = cursor
}

export function setPointerCursor(map: MapLibreMap, event: MapMouseEvent): void {
  const isOverFindspot =
    queryFindspotFeatures(map, event.point, INTERACTIVE_LAYER_IDS).length > 0
  setCanvasCursor(map, isOverFindspot ? 'pointer' : '')
}

export function showPointerCursor(map: MapLibreMap): void {
  setCanvasCursor(map, 'pointer')
}

export function resetPointerCursor(map: MapLibreMap): void {
  setCanvasCursor(map, '')
}
