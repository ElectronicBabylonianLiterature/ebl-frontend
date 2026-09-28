import type { Point } from 'geojson'
import maplibregl, {
  type GeoJSONSource,
  type Map as MapLibreMap,
  type MapGeoJSONFeature,
  type MapMouseEvent,
} from 'maplibre-gl'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import { createFindspotPopup } from 'map/createFindspotPopup'
import { getPopupProperties } from 'map/findspotPopupProperties'
import { getFeaturePointCoordinates } from 'map/pointCoordinates'
import {
  INTERACTIVE_LAYER_IDS,
  resetPointerCursor,
  setPointerCursor,
  showPointerCursor,
} from 'map/mapCursor'
import {
  SOURCE_ID,
  clusterCountLayer,
  clusterLayer,
  createFindspotsSource,
  unclusteredLayer,
} from 'map/mapLayers'
import { fitMapToData } from 'map/mapBounds'
import { INITIAL_CENTER, INITIAL_ZOOM } from 'map/mapCamera'
import { queryFindspotFeatures } from 'map/mapFeatureQuery'
import {
  MAP_STYLE_URL,
  type MapLibreErrorEvent,
  getReportableMapError,
  isMapBackgroundLoadError,
} from 'map/mapBackgroundError'
import { provenanceToGeoJson } from 'map/provenanceToGeoJson'

export interface FindspotMapHandlers {
  isActive: () => boolean
  navigate: (path: string) => void
  reportError: (error: Error) => void
}

export function initializeFindspotSource(
  map: MapLibreMap,
  provenances: readonly ProvenanceRecord[],
  shouldFitData: boolean,
): void {
  const geoJson = provenanceToGeoJson(provenances)
  map.addSource(SOURCE_ID, createFindspotsSource(geoJson))
  map.addLayer(clusterLayer)
  map.addLayer(clusterCountLayer)
  map.addLayer(unclusteredLayer)
  if (shouldFitData) fitMapToData(map, geoJson.features)
}

function expandCluster(
  map: MapLibreMap,
  cluster: MapGeoJSONFeature,
  handlers: FindspotMapHandlers,
): void {
  const clusterId = cluster.properties?.cluster_id
  if (typeof clusterId !== 'number') return
  const source = map.getSource(SOURCE_ID) as GeoJSONSource | undefined
  if (!source) return

  const center = (cluster.geometry as Point).coordinates.slice() as [
    number,
    number,
  ]
  const easeToClusterCenter = (zoom?: number): void => {
    if (handlers.isActive()) {
      map.easeTo(zoom === undefined ? { center } : { center, zoom })
    }
  }
  source
    .getClusterExpansionZoom(clusterId)
    .then(easeToClusterCenter)
    .catch((error: Error) => {
      handlers.reportError(error)
      easeToClusterCenter()
    })
}

function openFindspotPopup(
  map: MapLibreMap,
  feature: MapGeoJSONFeature,
  navigate: (path: string) => void,
): void {
  const coordinates = getFeaturePointCoordinates(feature)
  if (!coordinates) return
  const popupProperties = getPopupProperties(feature, coordinates)
  if (!popupProperties) return

  new maplibregl.Popup()
    .setLngLat(coordinates)
    .setDOMContent(createFindspotPopup(popupProperties, navigate))
    .addTo(map)
}

function handleMapClick(
  map: MapLibreMap,
  event: MapMouseEvent,
  handlers: FindspotMapHandlers,
): void {
  const [cluster] = queryFindspotFeatures(map, event.point, [clusterLayer.id])
  if (cluster) {
    expandCluster(map, cluster, handlers)
    return
  }
  const [findspot] = queryFindspotFeatures(map, event.point, [
    unclusteredLayer.id,
  ])
  if (findspot) openFindspotPopup(map, findspot, handlers.navigate)
}

export function createFindspotMap(
  container: HTMLDivElement,
  reportError: (error: Error) => void,
  onMapBackgroundErrorChange?: (hasError: boolean) => void,
): MapLibreMap | null {
  try {
    return new maplibregl.Map({
      container,
      style: MAP_STYLE_URL,
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
    })
  } catch (error) {
    reportError(error instanceof Error ? error : new Error(String(error)))
    onMapBackgroundErrorChange?.(true)
    return null
  }
}

export function bindFindspotMapEvents(
  map: MapLibreMap,
  handlers: FindspotMapHandlers,
  handleLoad: () => void,
  onMapBackgroundErrorChange?: (hasError: boolean) => void,
): () => void {
  const handleClick = (event: MapMouseEvent): void => {
    if (handlers.isActive()) handleMapClick(map, event, handlers)
  }
  const handleMouseMove = (event: MapMouseEvent): void => {
    if (handlers.isActive()) setPointerCursor(map, event)
    else resetPointerCursor(map)
  }
  const handleMouseEnter = (): void => {
    if (handlers.isActive()) showPointerCursor(map)
  }
  const handleMouseLeave = (): void => resetPointerCursor(map)
  const handleError = (event: MapLibreErrorEvent): void => {
    if (isMapBackgroundLoadError(event)) {
      onMapBackgroundErrorChange?.(true)
      return
    }
    const reportableError = getReportableMapError(event)
    if (reportableError) handlers.reportError(reportableError)
  }

  map.on('load', handleLoad)
  map.on('click', handleClick)
  map.on('mousemove', handleMouseMove)
  map.on('error', handleError)
  INTERACTIVE_LAYER_IDS.forEach((layerId) => {
    map.on('mouseenter', layerId, handleMouseEnter)
    map.on('mouseleave', layerId, handleMouseLeave)
  })

  return () => {
    map.off('load', handleLoad)
    map.off('click', handleClick)
    map.off('mousemove', handleMouseMove)
    map.off('error', handleError)
    INTERACTIVE_LAYER_IDS.forEach((layerId) => {
      map.off('mouseenter', layerId, handleMouseEnter)
      map.off('mouseleave', layerId, handleMouseLeave)
    })
  }
}
