import { useEffect, useRef } from 'react'
import type { MutableRefObject, RefObject } from 'react'
import type { Point } from 'geojson'
import maplibregl from 'maplibre-gl'
import type {
  GeoJSONSource,
  Map as MapLibreMap,
  MapGeoJSONFeature,
  MapMouseEvent,
} from 'maplibre-gl'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import { createFindspotPopup } from 'map/createFindspotPopup'
import {
  getFeaturePointCoordinates,
  getPopupProperties,
} from 'map/findspotPopupProperties'
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
import {
  MAP_STYLE_URL,
  type MapLibreErrorEvent,
  isMapBackgroundLoadError,
} from 'map/mapBackgroundError'
import { provenanceToGeoJson } from 'map/provenanceToGeoJson'

const INITIAL_CENTER: [number, number] = [44.4, 33.0]
const INITIAL_ZOOM = 5

function initializeFindspotSource(
  map: MapLibreMap,
  provenances: readonly ProvenanceRecord[],
): void {
  const geoJson = provenanceToGeoJson(provenances)
  map.addSource(SOURCE_ID, createFindspotsSource(geoJson))
  map.addLayer(clusterLayer)
  map.addLayer(clusterCountLayer)
  map.addLayer(unclusteredLayer)
  fitMapToData(map, geoJson.features)
}

function expandCluster(map: MapLibreMap, cluster: MapGeoJSONFeature): void {
  const clusterId = cluster.properties?.cluster_id
  if (typeof clusterId !== 'number') return

  const source = map.getSource(SOURCE_ID) as GeoJSONSource
  void source.getClusterExpansionZoom(clusterId).then((zoom) => {
    map.easeTo({
      center: (cluster.geometry as Point).coordinates.slice() as [
        number,
        number,
      ],
      zoom,
    })
  })
}

function openFindspotPopup(map: MapLibreMap, feature: MapGeoJSONFeature): void {
  const coordinates = getFeaturePointCoordinates(feature)
  if (!coordinates) return

  const popupProperties = getPopupProperties(feature, coordinates)
  if (!popupProperties) return

  new maplibregl.Popup()
    .setLngLat(coordinates)
    .setDOMContent(createFindspotPopup(popupProperties))
    .addTo(map)
}

function handleMapClick(map: MapLibreMap, event: MapMouseEvent): void {
  const [cluster] = map.queryRenderedFeatures(event.point, {
    layers: [clusterLayer.id],
  })
  if (cluster) {
    expandCluster(map, cluster)
    return
  }

  const [findspot] = map.queryRenderedFeatures(event.point, {
    layers: [unclusteredLayer.id],
  })
  if (findspot) {
    openFindspotPopup(map, findspot)
  }
}

export default function useFindspotMap(
  containerRef: RefObject<HTMLDivElement>,
  provenances: readonly ProvenanceRecord[] | null,
  onMapBackgroundError?: () => void,
): MutableRefObject<MapLibreMap | null> {
  const mapRef = useRef<MapLibreMap | null>(null)
  const latestProvenancesRef = useRef(provenances)
  latestProvenancesRef.current = provenances
  const isReady = provenances !== null

  useEffect(() => {
    if (!containerRef.current || !isReady) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
    })
    mapRef.current = map
    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    const handleLoad = () =>
      initializeFindspotSource(map, latestProvenancesRef.current!)
    const handleClick = (event: MapMouseEvent) => handleMapClick(map, event)
    const handleMouseMove = (event: MapMouseEvent) =>
      setPointerCursor(map, event)
    const handleMouseEnter = () => showPointerCursor(map)
    const handleMouseLeave = () => resetPointerCursor(map)
    const handleError = (event: MapLibreErrorEvent) => {
      if (isMapBackgroundLoadError(event)) {
        onMapBackgroundError?.()
      }
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
      map.remove()
      mapRef.current = null
    }
  }, [containerRef, isReady, onMapBackgroundError])

  return mapRef
}
