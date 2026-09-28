import type { Map as MapLibreMap } from 'maplibre-gl'
import type { MapLibreErrorEvent } from 'map/mapBackgroundError'
import { applyExcavationPaint } from 'map/mapChoroplethLayers'
import {
  createExcavationAreasSource,
  excavationAreaFillLayer,
  excavationAreaOutlineLayer,
  excavationAreaSelectedLayer,
} from 'map/mapExcavationLayers'
import type { ExcavationPaint } from 'map/mapExcavationPaint'
import {
  EXCAVATION_AREAS_SOURCE_ID,
  EXCAVATION_AREA_FILL_LAYER_ID,
  EXCAVATION_AREA_OUTLINE_LAYER_ID,
  EXCAVATION_AREA_SELECTED_LAYER_ID,
} from 'map/mapLayerIds'
import {
  featureStateFor,
  type PolygonVisualizationValues,
} from 'map/mapVisualizationValues'

const ALL_LAYER_IDS: readonly string[] = [
  EXCAVATION_AREA_FILL_LAYER_ID,
  EXCAVATION_AREA_OUTLINE_LAYER_ID,
  EXCAVATION_AREA_SELECTED_LAYER_ID,
]

export function addExcavationAreas(map: MapLibreMap): void {
  if (!map.getSource(EXCAVATION_AREAS_SOURCE_ID)) {
    map.addSource(EXCAVATION_AREAS_SOURCE_ID, createExcavationAreasSource())
  }
  ;[
    excavationAreaFillLayer,
    excavationAreaOutlineLayer,
    excavationAreaSelectedLayer,
  ].forEach((layer) => {
    if (!map.getLayer(layer.id)) map.addLayer(layer)
  })
}

export function removeExcavationAreas(map: MapLibreMap): void {
  ;[...ALL_LAYER_IDS].reverse().forEach((layerId) => {
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
  ALL_LAYER_IDS.forEach((layerId) => {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(
        layerId,
        'visibility',
        isVisible ? 'visible' : 'none',
      )
    }
  })
}

export function applyExcavationAreaSelection(
  map: MapLibreMap,
  previousId: string | null,
  nextId: string | null,
): void {
  if (previousId && previousId !== nextId) {
    map.setFeatureState(
      { source: EXCAVATION_AREAS_SOURCE_ID, id: previousId },
      { selected: false },
    )
  }
  if (nextId) {
    map.setFeatureState(
      { source: EXCAVATION_AREAS_SOURCE_ID, id: nextId },
      { selected: true },
    )
  }
}

export function applyExcavationAreaVisualization(
  map: MapLibreMap,
  paint: ExcavationPaint,
  values: PolygonVisualizationValues,
): void {
  applyExcavationPaint(map, paint)
  values.forEach((value, polygonId) => {
    map.setFeatureState(
      { source: EXCAVATION_AREAS_SOURCE_ID, id: polygonId },
      featureStateFor(value),
    )
  })
}

export function isExcavationAreaError(event: MapLibreErrorEvent): boolean {
  return (
    event.sourceId === EXCAVATION_AREAS_SOURCE_ID ||
    (typeof event.layer?.id === 'string' &&
      ALL_LAYER_IDS.includes(event.layer.id))
  )
}
