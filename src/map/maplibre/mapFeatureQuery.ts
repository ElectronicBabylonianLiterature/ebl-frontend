import type {
  Map as MapLibreMap,
  MapGeoJSONFeature,
  PointLike,
} from 'maplibre-gl'

export function queryFindspotFeatures(
  map: MapLibreMap,
  point: PointLike,
  layerIds: readonly string[],
): MapGeoJSONFeature[] {
  const areLayersAdded = layerIds.every(
    (layerId) => map.getLayer(layerId) !== undefined,
  )
  if (!areLayersAdded) return []

  return map.queryRenderedFeatures(point, { layers: [...layerIds] })
}
