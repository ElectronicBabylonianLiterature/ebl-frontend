import type { Point } from 'geojson'
import { Popup } from 'maplibre-gl'
import type {
  GeoJSONSource,
  Map as MapLibreMap,
  MapGeoJSONFeature,
  MapMouseEvent,
} from 'maplibre-gl'
import { createFindspotPopup } from 'map/createFindspotPopup'
import { getPopupProperties } from 'map/findspotPopupProperties'
import { getFeaturePointCoordinates } from 'map/pointCoordinates'
import {
  INTERACTIVE_LAYER_IDS,
  resetPointerCursor,
  setPointerCursor,
  showPointerCursor,
} from 'map/mapCursor'
import { SOURCE_ID, clusterLayer, unclusteredLayer } from 'map/mapLayers'
import { queryFindspotFeatures } from 'map/mapFeatureQuery'

export interface FindspotMapHandlers {
  isActive: () => boolean
  getInteractionVersion: () => number
  navigate: (path: string) => void
  reportError: (error: Error) => void
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
  const easeToClusterCenter = (zoom?: number): void => {
    if (
      handlers.isActive() &&
      handlers.getInteractionVersion() === interactionVersion
    ) {
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

  new Popup()
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
  if (findspot) {
    openFindspotPopup(map, findspot, handlers.navigate)
  }
}

export function subscribeFindspotInteractions(
  map: MapLibreMap,
  handlers: FindspotMapHandlers,
): () => void {
  let clickVersion = 0
  const handleClick = (event: MapMouseEvent): void => {
    if (!handlers.isActive()) return
    clickVersion += 1
    const currentClickVersion = clickVersion
    handleMapClick(map, event, {
      ...handlers,
      isActive: () =>
        handlers.isActive() && currentClickVersion === clickVersion,
    })
  }
  const handleMouseMove = (event: MapMouseEvent): void => {
    if (handlers.isActive()) setPointerCursor(map, event)
    else resetPointerCursor(map)
  }
  const handleMouseEnter = (): void => {
    if (handlers.isActive()) showPointerCursor(map)
  }
  const handleMouseLeave = (): void => resetPointerCursor(map)

  map.on('click', handleClick)
  map.on('mousemove', handleMouseMove)
  INTERACTIVE_LAYER_IDS.forEach((layerId) => {
    map.on('mouseenter', layerId, handleMouseEnter)
    map.on('mouseleave', layerId, handleMouseLeave)
  })

  return () => {
    map.off('click', handleClick)
    map.off('mousemove', handleMouseMove)
    INTERACTIVE_LAYER_IDS.forEach((layerId) => {
      map.off('mouseenter', layerId, handleMouseEnter)
      map.off('mouseleave', layerId, handleMouseLeave)
    })
  }
}
