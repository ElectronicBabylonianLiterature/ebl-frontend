import { useContext, useEffect, useRef } from 'react'
import type { MutableRefObject, RefObject } from 'react'
import type { Point } from 'geojson'
import maplibregl from 'maplibre-gl'
import ErrorReporterContext from 'ErrorReporterContext'
import { useHistory } from 'router/compat'
import type {
  GeoJSONSource,
  Map as MapLibreMap,
  MapGeoJSONFeature,
  MapMouseEvent,
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

interface FindspotMapHandlers {
  isActive: () => boolean
  navigate: (path: string) => void
  reportError: (error: Error) => void
}

function initializeFindspotSource(
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
  if (findspot) {
    openFindspotPopup(map, findspot, handlers.navigate)
  }
}

export default function useFindspotMap(
  containerRef: RefObject<HTMLDivElement>,
  provenances: readonly ProvenanceRecord[] | null,
  onMapBackgroundErrorChange?: (hasError: boolean) => void,
  cameraResetVersion = 0,
  isInteractionEnabled = true,
): MutableRefObject<MapLibreMap | null> {
  const mapRef = useRef<MapLibreMap | null>(null)
  const history = useHistory()
  const errorReporter = useContext(ErrorReporterContext)
  const latestProvenancesRef = useRef(provenances)
  latestProvenancesRef.current = provenances
  const latestInteractionEnabledRef = useRef(isInteractionEnabled)
  latestInteractionEnabledRef.current = isInteractionEnabled
  const latestCameraResetVersionRef = useRef(cameraResetVersion)
  const previousCameraResetVersionRef = useRef(cameraResetVersion)
  const cameraResetProvenancesRef = useRef(provenances)
  latestCameraResetVersionRef.current = cameraResetVersion
  if (previousCameraResetVersionRef.current !== cameraResetVersion) {
    previousCameraResetVersionRef.current = cameraResetVersion
    cameraResetProvenancesRef.current = provenances
  }
  const latestServicesRef = useRef({ history, errorReporter })
  latestServicesRef.current = { history, errorReporter }
  const isReady = provenances !== null

  useEffect(() => {
    if (!containerRef.current || !isReady) return

    const cameraResetVersionAtCreation = latestCameraResetVersionRef.current
    let map: MapLibreMap
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: MAP_STYLE_URL,
        center: INITIAL_CENTER,
        zoom: INITIAL_ZOOM,
      })
    } catch (error) {
      latestServicesRef.current.errorReporter.captureException(
        error instanceof Error ? error : new Error(String(error)),
      )
      onMapBackgroundErrorChange?.(true)
      return
    }
    mapRef.current = map
    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    let isActive = true
    const handlers: FindspotMapHandlers = {
      isActive: () => isActive && latestInteractionEnabledRef.current,
      navigate: (path) => latestServicesRef.current.history.push(path),
      reportError: (error) =>
        latestServicesRef.current.errorReporter.captureException(error),
    }
    const handleLoad = () => {
      onMapBackgroundErrorChange?.(false)
      const loadedProvenances = latestProvenancesRef.current
      if (loadedProvenances) {
        const resetStillOwnsLatestData =
          latestCameraResetVersionRef.current !==
            cameraResetVersionAtCreation &&
          loadedProvenances === cameraResetProvenancesRef.current
        initializeFindspotSource(
          map,
          loadedProvenances,
          !resetStillOwnsLatestData,
        )
      }
    }
    const handleClick = (event: MapMouseEvent) => {
      if (handlers.isActive()) handleMapClick(map, event, handlers)
    }
    const handleMouseMove = (event: MapMouseEvent) =>
      handlers.isActive()
        ? setPointerCursor(map, event)
        : resetPointerCursor(map)
    const handleMouseEnter = () => {
      if (handlers.isActive()) showPointerCursor(map)
    }
    const handleMouseLeave = () => resetPointerCursor(map)
    const handleError = (event: MapLibreErrorEvent) => {
      if (isMapBackgroundLoadError(event)) {
        onMapBackgroundErrorChange?.(true)
        return
      }
      const reportableError = getReportableMapError(event)
      if (reportableError) {
        handlers.reportError(reportableError)
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
      isActive = false
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
  }, [containerRef, isReady, onMapBackgroundErrorChange])

  useEffect(() => {
    if (!isInteractionEnabled && mapRef.current) {
      resetPointerCursor(mapRef.current)
    }
  }, [isInteractionEnabled])

  return mapRef
}
