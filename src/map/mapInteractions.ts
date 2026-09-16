import type { MutableRefObject } from 'react'
import type {
  GeoJSONSource,
  Map as MapLibreMap,
  MapGeoJSONFeature,
  MapMouseEvent,
} from 'maplibre-gl'
import {
  clusterLayer,
  excavationAreaFillLayer,
  polygonFillLayer,
  unclusteredLayer,
  SOURCE_ID,
} from './mapLayers'
import { focusFeature } from './mapCamera'
import { firstPosition } from './mapGeometry'
import {
  featureStringProperty,
  setExcavationFeatureState,
} from './mapFeatureState'
import type { PolygonFindspotSummary } from './findspotMapData'
import type { SiteResearchSummaries } from './mapSiteSummaries'
import { polygonHoverPreview, siteHoverPreview } from './mapHoverPreview'
import { UNNAMED_EXCAVATION_AREA } from './mapResearchSummary'
import type { MapHoverPreview, MapSelection } from './mapSelection'

export const INTERACTIVE_LAYER_IDS = [
  clusterLayer.id,
  unclusteredLayer.id,
  excavationAreaFillLayer.id,
  polygonFillLayer.id,
]

function queryFirstFeature(
  map: MapLibreMap,
  event: MapMouseEvent,
  layerId: string,
): MapGeoJSONFeature | undefined {
  const [feature] = map.queryRenderedFeatures(event.point, {
    layers: [layerId],
  })
  return feature
}

function expandCluster(map: MapLibreMap, cluster: MapGeoJSONFeature): void {
  const clusterId = cluster.properties?.cluster_id
  const center = firstPosition(cluster.geometry)
  if (typeof clusterId !== 'number' || !center) return

  const source = map.getSource(SOURCE_ID) as GeoJSONSource
  void source
    .getClusterExpansionZoom(clusterId)
    .then((zoom) => map.easeTo({ center: [...center], zoom }))
}

function selectFeature(
  map: MapLibreMap,
  feature: MapGeoJSONFeature,
  toSelection: (id: string) => MapSelection,
  onSelectFeature: (selection: MapSelection) => void,
): void {
  const id = featureStringProperty(feature, 'id')
  if (!id) return

  focusFeature(map, feature)
  onSelectFeature(toSelection(id))
}

export function handleMapClick(
  map: MapLibreMap,
  event: MapMouseEvent,
  onSelectFeature: (selection: MapSelection) => void,
): void {
  const cluster = queryFirstFeature(map, event, clusterLayer.id)
  if (cluster) {
    expandCluster(map, cluster)
    return
  }

  const findspot = queryFirstFeature(map, event, unclusteredLayer.id)
  if (findspot) {
    selectFeature(
      map,
      findspot,
      (provenanceId) => ({ type: 'site', provenanceId }),
      onSelectFeature,
    )
    return
  }

  const excavationArea = queryFirstFeature(
    map,
    event,
    excavationAreaFillLayer.id,
  )
  if (excavationArea) {
    selectFeature(
      map,
      excavationArea,
      (polygonId) => ({ type: 'excavation-area', polygonId }),
      onSelectFeature,
    )
    return
  }

  const polygon = queryFirstFeature(map, event, polygonFillLayer.id)
  if (polygon) {
    selectFeature(
      map,
      polygon,
      (provenanceId) => ({ type: 'site', provenanceId }),
      onSelectFeature,
    )
  }
}

function updateHoveredPolygon(
  map: MapLibreMap,
  hoveredPolygonIdRef: MutableRefObject<string | null>,
  nextPolygonId: string | null,
): void {
  if (hoveredPolygonIdRef.current === nextPolygonId) return

  if (hoveredPolygonIdRef.current) {
    setExcavationFeatureState(map, hoveredPolygonIdRef.current, {
      hover: false,
    })
  }

  if (nextPolygonId) {
    setExcavationFeatureState(map, nextPolygonId, { hover: true })
  }

  hoveredPolygonIdRef.current = nextPolygonId
}

export interface MapHoverContext {
  readonly findspotSummaries: ReadonlyMap<string, PolygonFindspotSummary>
  readonly siteSummaries: SiteResearchSummaries
}

export function handleMapHover(
  map: MapLibreMap,
  event: MapMouseEvent,
  hoveredPolygonIdRef: MutableRefObject<string | null>,
  context: MapHoverContext,
  onHoverPreview: (preview: MapHoverPreview | null) => void,
): void {
  const hasPointerTarget =
    map.queryRenderedFeatures(event.point, { layers: INTERACTIVE_LAYER_IDS })
      .length > 0
  map.getCanvas().style.cursor = hasPointerTarget ? 'pointer' : ''

  const excavationArea = queryFirstFeature(
    map,
    event,
    excavationAreaFillLayer.id,
  )
  const nextPolygonId = excavationArea
    ? featureStringProperty(excavationArea, 'id')
    : null
  updateHoveredPolygon(map, hoveredPolygonIdRef, nextPolygonId)

  if (excavationArea && nextPolygonId) {
    onHoverPreview(
      polygonHoverPreview(
        featureStringProperty(excavationArea, 'name') ??
          UNNAMED_EXCAVATION_AREA,
        context.findspotSummaries.get(nextPolygonId),
        event.point,
      ),
    )
    return
  }

  const findspot = queryFirstFeature(map, event, unclusteredLayer.id)
  const siteId = findspot ? featureStringProperty(findspot, 'id') : null
  const siteName = findspot ? featureStringProperty(findspot, 'name') : null

  onHoverPreview(
    siteName === null
      ? null
      : siteHoverPreview(
          siteName,
          siteId === null ? undefined : context.siteSummaries.get(siteId),
          event.point,
        ),
  )
}

export function clearHoverState(
  map: MapLibreMap,
  hoveredPolygonIdRef: MutableRefObject<string | null>,
  onHoverPreview: (preview: MapHoverPreview | null) => void,
): void {
  updateHoveredPolygon(map, hoveredPolygonIdRef, null)
  map.getCanvas().style.cursor = ''
  onHoverPreview(null)
}
