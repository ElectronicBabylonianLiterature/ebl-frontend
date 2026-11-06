import type { Map as MapLibreMap } from 'maplibre-gl'
import { EXCAVATION_AREAS_SOURCE_ID } from 'map/mapLayerIds'
import {
  featureStateFor,
  type PolygonVisualizationValues,
} from 'map/mapVisualizationValues'

export function applySelection(
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

export function applyVisualizationValues(
  map: MapLibreMap,
  values: PolygonVisualizationValues,
): void {
  values.forEach((value, polygonId) => {
    map.setFeatureState(
      { source: EXCAVATION_AREAS_SOURCE_ID, id: polygonId },
      featureStateFor(value),
    )
  })
}
