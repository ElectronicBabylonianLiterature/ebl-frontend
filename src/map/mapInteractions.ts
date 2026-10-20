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
} from 'map/mapLayers'
import { focusFeature, focusProvenance } from 'map/mapCamera'
import type { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import { firstPosition } from 'map/mapGeometry'
import {
  featureStringProperty,
  setExcavationFeatureState,
} from 'map/mapFeatureState'
import type { PolygonFindspotSummary } from 'map/findspotMapData'
import type { SiteResearchSummaries } from 'map/mapSiteSummaries'
import { polygonHoverPreview, siteHoverPreview } from 'map/mapHoverPreview'
import { UNNAMED_EXCAVATION_AREA } from 'map/mapResearchSummary'
import type { MapHoverPreview, MapSelection } from 'map/mapSelection'

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
  if (!map.getLayer(layerId)) return undefined
  const [feature] = map.queryRenderedFeatures(event.point, {
    layers: [layerId],
  })
  return feature
}

function expandCluster(
  map: MapLibreMap,
  cluster: MapGeoJSONFeature,
  isCurrent: () => boolean,
): void {
  const clusterId = cluster.properties?.cluster_id
  const center = firstPosition(cluster.geometry)
  if (typeof clusterId !== 'number' || !center) return

  const source = map.getSource(SOURCE_ID) as GeoJSONSource | undefined
  if (!source?.getClusterExpansionZoom) return
  void source
    .getClusterExpansionZoom(clusterId)
    .then((zoom) => {
      if (!isCurrent() || !Number.isFinite(zoom)) return
      if (map.getSource(SOURCE_ID) === source)
        map.easeTo({ center: [...center], zoom })
    })
    .catch(() => undefined)
}

function selectFeature(
  map: MapLibreMap,
  feature: MapGeoJSONFeature,
  toSelection: (id: string) => MapSelection,
  onSelectFeature: (selection: MapSelection) => void,
  provenances?: readonly ProvenanceRecord[],
): void {
  const id = featureStringProperty(feature, 'id')
  if (!id) return

  const provenance = provenances?.find((entry) => entry.id === id)
  if (provenance) focusProvenance(map, provenance)
  else focusFeature(map, feature)
  onSelectFeature(toSelection(id))
}

export function handleMapClick(
  map: MapLibreMap,
  event: MapMouseEvent,
  onSelectFeature: (selection: MapSelection) => void,
  isCurrent: () => boolean = () => true,
  provenances?: readonly ProvenanceRecord[],
): void {
  const cluster = queryFirstFeature(map, event, clusterLayer.id)
  if (cluster) {
    expandCluster(map, cluster, isCurrent)
    return
  }

  const findspot = queryFirstFeature(map, event, unclusteredLayer.id)
  if (findspot) {
    selectFeature(
      map,
      findspot,
      (provenanceId) => ({ type: 'site', provenanceId }),
      onSelectFeature,
      provenances,
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
      provenances,
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
  const layers = INTERACTIVE_LAYER_IDS.filter((id) => map.getLayer(id))
  const hasPointerTarget =
    layers.length > 0 &&
    map.queryRenderedFeatures(event.point, { layers }).length > 0
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
