import type { GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl'
import type { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import {
  SOURCE_ID,
  clusterCountLayer,
  clusterLayer,
  createFindspotsSource,
  unclusteredLayer,
} from 'map/maplibre/mapLayers'
import { fitMapToData } from 'map/maplibre/mapBounds'
import { provenanceToGeoJson } from 'map/domain/provenanceToGeoJson'

export function initializeFindspotSource(
  map: MapLibreMap,
  provenances: readonly ProvenanceRecord[],
  shouldFitData: boolean,
): void {
  const geoJson = provenanceToGeoJson(provenances)
  const source = map.getSource(SOURCE_ID) as GeoJSONSource | undefined
  if (source) source.setData(geoJson)
  else map.addSource(SOURCE_ID, createFindspotsSource(geoJson))
  ;[clusterLayer, clusterCountLayer, unclusteredLayer].forEach((layer) => {
    if (!map.getLayer(layer.id)) map.addLayer(layer)
  })
  if (shouldFitData) fitMapToData(map, geoJson.features)
}
