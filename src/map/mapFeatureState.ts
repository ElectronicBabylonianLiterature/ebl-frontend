import type { Map as MapLibreMap, MapGeoJSONFeature } from 'maplibre-gl'
import { EXCAVATION_AREAS_SOURCE_ID, SOURCE_ID } from 'map/mapLayers'
import {
  type PolygonVisualizationValues,
  featureStateFor,
} from 'map/mapVisualizationValues'
import type { MapSelection } from 'map/mapSelection'
import type { SiteMarkerState } from 'map/mapSiteSummaries'

export function featureStringProperty(
  feature: MapGeoJSONFeature,
  property: string,
): string | null {
  const value = feature.properties?.[property]
  return typeof value === 'string' ? value : null
}

export function setExcavationFeatureState(
  map: MapLibreMap,
  polygonId: string,
  state: Record<string, unknown>,
): void {
  if (!map.getSource(EXCAVATION_AREAS_SOURCE_ID)) return
  map.setFeatureState(
    { source: EXCAVATION_AREAS_SOURCE_ID, id: polygonId },
    state,
  )
}

export function selectedSiteId(selection: MapSelection | null): string | null {
  return selection?.type === 'site' ? selection.provenanceId : null
}

export function selectedPolygonId(
  selection: MapSelection | null,
): string | null {
  return selection?.type === 'excavation-area' ? selection.polygonId : null
}

export function applyFindspotSummaryState(
  map: MapLibreMap,
  values: PolygonVisualizationValues,
): void {
  for (const [polygonId, value] of values) {
    setExcavationFeatureState(map, polygonId, featureStateFor(value))
  }
}

/**
 * Site markers are styled from feature state for the same reason polygons
 * are: the source and its cluster index are built once, and what a marker
 * says about its site changes without rebuilding either.
 */
export function applySiteMarkerState(
  map: MapLibreMap,
  states: ReadonlyMap<string, SiteMarkerState>,
): void {
  if (!map.getSource(SOURCE_ID)) return
  for (const [provenanceId, state] of states) {
    map.setFeatureState({ source: SOURCE_ID, id: provenanceId }, state)
  }
}

function moveSelectedState(
  map: MapLibreMap,
  sourceId: string,
  previousId: string | null,
  nextId: string | null,
): void {
  if (!map.getSource(sourceId)) return
  if (previousId && previousId !== nextId) {
    map.setFeatureState(
      { source: sourceId, id: previousId },
      { selected: false },
    )
  }

  if (nextId) {
    map.setFeatureState({ source: sourceId, id: nextId }, { selected: true })
  }
}

export function applySelectionState(
  map: MapLibreMap,
  selection: MapSelection | null,
  previous: { polygonId: string | null; siteId: string | null },
): { polygonId: string | null; siteId: string | null } {
  const polygonId = selectedPolygonId(selection)
  const siteId = selectedSiteId(selection)

  moveSelectedState(
    map,
    EXCAVATION_AREAS_SOURCE_ID,
    previous.polygonId,
    polygonId,
  )
  moveSelectedState(map, SOURCE_ID, previous.siteId, siteId)

  return { polygonId, siteId }
}
