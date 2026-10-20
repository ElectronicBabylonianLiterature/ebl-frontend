import type { Point } from 'geojson'
import maplibregl, {
  type GeoJSONSource,
  type Map as MapLibreMap,
  type MapGeoJSONFeature,
  type MapMouseEvent,
} from 'maplibre-gl'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import { createFindspotPopup } from 'map/createFindspotPopup'
import { focusFindspot } from 'map/focusFindspot'
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
  isCurrentMap: () => boolean
  getInteractionVersion: () => number
  provenances: () => readonly ProvenanceRecord[] | null
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
  const interactionVersion = handlers.getInteractionVersion()
  const isCurrentInteraction = (): boolean =>
    handlers.isActive() &&
    handlers.getInteractionVersion() === interactionVersion
  const easeToClusterCenter = (zoom?: number): void => {
    if (isCurrentInteraction()) {
      map.easeTo(zoom === undefined ? { center } : { center, zoom })
    }
  }
  source
    .getClusterExpansionZoom(clusterId)
    .then(easeToClusterCenter)
    .catch((error: Error) => {
      if (isCurrentInteraction()) handlers.reportError(error)
      easeToClusterCenter()
    })
}

function openFindspotPopup(
  map: MapLibreMap,
  feature: MapGeoJSONFeature,
  handlers: FindspotMapHandlers,
): void {
  const coordinates = getFeaturePointCoordinates(feature)
  if (!coordinates) return
  const popupProperties = getPopupProperties(feature, coordinates)
  if (!popupProperties) return

  focusFindspot(
    map,
    coordinates,
    handlers.provenances()?.find(({ id }) => id === feature.properties?.id),
  )
  new maplibregl.Popup()
    .setLngLat(coordinates)
    .setDOMContent(createFindspotPopup(popupProperties, handlers.navigate))
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
  if (findspot) openFindspotPopup(map, findspot, handlers)
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

function createFindspotClickHandler(
  map: MapLibreMap,
  handlers: FindspotMapHandlers,
): (event: MapMouseEvent) => void {
  let clickVersion = 0
  return (event) => {
    if (!handlers.isActive()) return
    clickVersion += 1
    const currentClickVersion = clickVersion
    handleMapClick(map, event, {
      ...handlers,
      isActive: () =>
        handlers.isActive() && currentClickVersion === clickVersion,
    })
  }
}

function createFindspotErrorHandler(
  handlers: FindspotMapHandlers,
  onMapBackgroundErrorChange?: (hasError: boolean) => void,
): (event: MapLibreErrorEvent) => void {
  return (event) => {
    if (!handlers.isCurrentMap()) return
    if (isMapBackgroundLoadError(event)) {
      onMapBackgroundErrorChange?.(true)
      return
    }
    const reportableError = getReportableMapError(event)
    if (reportableError) handlers.reportError(reportableError)
  }
}

export function bindFindspotMapEvents(
  map: MapLibreMap,
  handlers: FindspotMapHandlers,
  handleLoad: () => void,
  onMapBackgroundErrorChange?: (hasError: boolean) => void,
): () => void {
  const handleClick = createFindspotClickHandler(map, handlers)
  const handleError = createFindspotErrorHandler(
    handlers,
    onMapBackgroundErrorChange,
  )
  const handleMouseMove = (event: MapMouseEvent): void => {
    if (!handlers.isCurrentMap()) return
    if (handlers.isActive()) setPointerCursor(map, event)
    else resetPointerCursor(map)
  }
  const handleMouseEnter = (): void => {
    if (handlers.isActive()) showPointerCursor(map)
  }
  const handleMouseLeave = (): void => {
    if (handlers.isCurrentMap()) resetPointerCursor(map)
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
