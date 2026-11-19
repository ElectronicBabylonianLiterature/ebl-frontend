import type { Map as MapLibreMap } from 'maplibre-gl'
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
): void {
  const geoJson = provenanceToGeoJson(provenances)
  map.addSource(SOURCE_ID, createFindspotsSource(geoJson))
  map.addLayer(clusterLayer)
  map.addLayer(clusterCountLayer)
  map.addLayer(unclusteredLayer)
  fitMapToData(map, geoJson.features)
}
