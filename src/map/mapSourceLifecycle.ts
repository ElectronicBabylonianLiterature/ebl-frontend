import type { Map as MapLibreMap } from 'maplibre-gl'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import {
  EXCAVATION_AREA_FILL_LAYER_ID,
  EXCAVATION_AREA_OUTLINE_LAYER_ID,
  EXCAVATION_AREAS_SOURCE_ID,
  POLYGON_SOURCE_ID,
  SOURCE_ID,
  clusterCountLayer,
  clusterLayer,
  createExcavationAreasSource,
  createFindspotPolygonsSource,
  createFindspotsSource,
  excavationAreaFillLayer,
  excavationAreaOutlineLayer,
  excavationAreaSelectedLayer,
  polygonFillLayer,
  polygonOutlineLayer,
  unclusteredLayer,
} from './mapLayers'
import {
  EXCAVATION_EXTRUSION_LAYER_ID,
  createExcavationExtrusionLayer,
} from './mapExtrusionLayers'
import { CATEGORICAL_PAINT } from './mapExcavationPaint'
import { fitMapToData } from './mapCamera'
import { provenanceToGeoJson } from './provenanceToGeoJson'
import { provenancesToPolygonGeoJson } from './provenanceToPolygonGeoJson'

function setLayerVisibility(
  map: MapLibreMap,
  layerIds: readonly string[],
  isVisible: boolean,
): void {
  const visibility = isVisible ? 'visible' : 'none'

  for (const layerId of layerIds) {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, 'visibility', visibility)
    }
  }
}

export function setBoundaryVisibility(
  map: MapLibreMap,
  isVisible: boolean,
): void {
  setLayerVisibility(
    map,
    [polygonFillLayer.id, polygonOutlineLayer.id],
    isVisible,
  )
}

export function setExcavationAreaVisibility(
  map: MapLibreMap,
  isVisible: boolean,
): void {
  setLayerVisibility(
    map,
    [
      EXCAVATION_AREA_FILL_LAYER_ID,
      EXCAVATION_AREA_OUTLINE_LAYER_ID,
      excavationAreaSelectedLayer.id,
    ],
    isVisible,
  )

  // The extrusion is only ever shown by the 3D controls, so hiding the
  // excavation layers must hide it too but showing them must not reveal it.
  if (!isVisible) {
    setLayerVisibility(map, [EXCAVATION_EXTRUSION_LAYER_ID], false)
  }
}

export function initializeFindspotSources(
  map: MapLibreMap,
  provenances: readonly ProvenanceRecord[],
  showBoundaries: boolean,
  showExcavationAreas: boolean,
): void {
  const pointGeoJson = provenanceToGeoJson(provenances)

  map.addSource(
    POLYGON_SOURCE_ID,
    createFindspotPolygonsSource(provenancesToPolygonGeoJson(provenances)),
  )
  map.addLayer(polygonFillLayer)
  map.addLayer(polygonOutlineLayer)
  setBoundaryVisibility(map, showBoundaries)

  map.addSource(EXCAVATION_AREAS_SOURCE_ID, createExcavationAreasSource())
  map.addLayer(excavationAreaFillLayer)
  map.addLayer(excavationAreaOutlineLayer)
  map.addLayer(createExcavationExtrusionLayer(CATEGORICAL_PAINT, null))
  map.addLayer(excavationAreaSelectedLayer)
  setExcavationAreaVisibility(map, showExcavationAreas)

  map.addSource(SOURCE_ID, createFindspotsSource(pointGeoJson))
  map.addLayer(clusterLayer)
  map.addLayer(clusterCountLayer)
  map.addLayer(unclusteredLayer)
  fitMapToData(map, pointGeoJson.features)
}
