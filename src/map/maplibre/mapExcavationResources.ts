import type { Map as MapLibreMap } from 'maplibre-gl'
import type { ExcavationPolygonIndex } from 'map/domain/excavationPolygonIndex'
import {
  clusterLayer,
  clusterCountLayer,
  unclusteredLayer,
} from 'map/maplibre/mapLayers'
import { EXCAVATION_AREAS_SOURCE_ID } from 'map/domain/mapLayerIds'
import {
  createExcavationAreasSource,
  excavationAreaFillLayer,
  excavationAreaOutlineLayer,
  excavationAreaSelectedLayer,
  EXCAVATION_AREA_LAYER_IDS,
} from 'map/maplibre/mapExcavationLayers'

export const ALL_EXCAVATION_AREA_LAYER_IDS = EXCAVATION_AREA_LAYER_IDS
export function addExcavationAreas(
  map: MapLibreMap,
  polygonIndex: ExcavationPolygonIndex,
): void {
  if (!map.getSource(EXCAVATION_AREAS_SOURCE_ID)) {
    map.addSource(
      EXCAVATION_AREAS_SOURCE_ID,
      createExcavationAreasSource(polygonIndex),
    )
  }
  let beforeId = [clusterLayer, clusterCountLayer, unclusteredLayer].find(
    (layer) => map.getLayer(layer.id),
  )?.id
  ;[
    excavationAreaSelectedLayer,
    excavationAreaOutlineLayer,
    excavationAreaFillLayer,
  ].forEach((layer) => {
    if (!map.getLayer(layer.id)) map.addLayer(layer, beforeId)
    beforeId = layer.id
  })
}

export function removeExcavationAreas(map: MapLibreMap): void {
  ;[...ALL_EXCAVATION_AREA_LAYER_IDS].reverse().forEach((layerId) => {
    if (map.getLayer(layerId)) map.removeLayer(layerId)
  })
  if (map.getSource(EXCAVATION_AREAS_SOURCE_ID)) {
    map.removeSource(EXCAVATION_AREAS_SOURCE_ID)
  }
}

export function setExcavationAreasVisible(
  map: MapLibreMap,
  isVisible: boolean,
): void {
  ALL_EXCAVATION_AREA_LAYER_IDS.forEach((layerId) => {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(
        layerId,
        'visibility',
        isVisible ? 'visible' : 'none',
      )
    }
  })
}
