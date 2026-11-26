import { useContext, useEffect, useRef } from 'react'
import type { MutableRefObject, RefObject } from 'react'
import type { Point } from 'geojson'
import * as maplibregl from 'maplibre-gl'
import ErrorReporterContext from 'ErrorReporterContext'
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs'
import { useHistory } from 'router/compat'
import type {
  GeoJSONSource,
  Map as MapLibreMap,
  MapGeoJSONFeature,
  MapMouseEvent,
} from 'maplibre-gl'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import { createFindspotPopup } from 'map/ui/createFindspotPopup'
import { focusFindspot } from 'map/maplibre/focusFindspot'
import { getPopupProperties } from 'map/maplibre/findspotPopupProperties'
import { getFeaturePointCoordinates } from 'map/domain/pointCoordinates'
import { subscribeFindspotMapEvents } from 'map/maplibre/mapFindspotEvents'
import {
  MAP_STYLE_LOAD_EVENT,
  SOURCE_ID,
  clusterLayer,
  unclusteredLayer,
} from 'map/maplibre/mapLayers'
import { createFindspotStyleHandlers } from 'map/maplibre/mapFindspotStyle'
import { INITIAL_CENTER, INITIAL_ZOOM } from 'map/maplibre/mapCamera'
import { queryFindspotFeatures } from 'map/maplibre/mapFeatureQuery'
import { MAP_STYLE_URL } from 'map/maplibre/mapBackgroundError'
import { EXCAVATION_AREA_FILL_LAYER_ID } from 'map/maplibre/mapExcavationLayers'
import useMapCameraOwnership, {
  type MapCameraOwnership,
} from 'map/maplibre/useMapCameraOwnership'

interface FindspotMapOptions {
  readonly onMapBackgroundErrorChange?: (hasError: boolean) => void
  readonly camera?: MapCameraOwnership
  readonly onFindspotSelect?: (id: string) => void
  readonly onExcavationSelect?: (polygonId: string) => void
}

interface FindspotMapHandlers {
  isActive: () => boolean
  camera: MapCameraOwnership
  provenances: () => readonly ProvenanceRecord[] | null
  navigate: (path: string) => void
  reportError: (error: Error) => void
  onFindspotSelect?: (id: string) => void
  onExcavationSelect?: (polygonId: string) => void
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
  const isCurrent = handlers.camera.claim()
  const isActive = () => handlers.isActive() && isCurrent()

  const center = (cluster.geometry as Point).coordinates.slice() as [
    number,
    number,
  ]
  const easeToClusterCenter = (zoom?: number): void => {
    if (isActive()) {
      map.easeTo(zoom === undefined ? { center } : { center, zoom })
    }
  }

  source
    .getClusterExpansionZoom(clusterId)
    .then(easeToClusterCenter)
    .catch((error: Error) => {
      if (isActive()) handlers.reportError(error)
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
  handlers.camera.claim()

  if (typeof feature.properties?.id === 'string') {
    handlers.onFindspotSelect?.(feature.properties.id)
  }
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
  if (findspot) {
    openFindspotPopup(map, findspot, handlers)
    return
  }

  const [area] = queryFindspotFeatures(map, event.point, [
    EXCAVATION_AREA_FILL_LAYER_ID,
  ])
  if (typeof area?.properties?.id === 'string') {
    handlers.camera.claim()
    handlers.onExcavationSelect?.(area.properties.id)
  }
}

export default function useFindspotMap(
  containerRef: RefObject<HTMLDivElement>,
  provenances: readonly ProvenanceRecord[] | null,
  {
    onMapBackgroundErrorChange,
    camera: sharedCamera,
    onFindspotSelect,
    onExcavationSelect,
  }: FindspotMapOptions = {},
): MutableRefObject<MapLibreMap | null> {
  const mapRef = useRef<MapLibreMap | null>(null)
  const defaultCamera = useMapCameraOwnership(provenances)
  const camera = sharedCamera ?? defaultCamera
  const history = useHistory()
  const errorReporter = useContext(ErrorReporterContext)
  const latestProvenancesRef = useRef(provenances)
  latestProvenancesRef.current = provenances
  const latestSelectionRef = useRef({ onFindspotSelect, onExcavationSelect })
  latestSelectionRef.current = { onFindspotSelect, onExcavationSelect }
  const latestServicesRef = useRef({ history, errorReporter })
  latestServicesRef.current = { history, errorReporter }
  const isReady = provenances !== null

  useEffect(() => {
    if (!containerRef.current || !isReady) return

    const isInitialCamera = camera.capture()
    let map: MapLibreMap
    try {
      maplibregl.setWorkerUrl(maplibreWorkerUrl)
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
    let clickVersion = 0
    const handlers: FindspotMapHandlers = {
      isActive: () => isActive && mapRef.current === map,
      camera,
      provenances: () => latestProvenancesRef.current,
      navigate: (path) => latestServicesRef.current.history.push(path),
      reportError: (error) =>
        latestServicesRef.current.errorReporter.captureException(error),
      onFindspotSelect: (id) =>
        latestSelectionRef.current.onFindspotSelect?.(id),
      onExcavationSelect: (id) =>
        latestSelectionRef.current.onExcavationSelect?.(id),
    }
    const styleHandlers = createFindspotStyleHandlers(map, {
      camera,
      provenances: handlers.provenances,
      isInitialCamera,
      onBackgroundErrorChange: onMapBackgroundErrorChange,
    })
    const unsubscribe = subscribeFindspotMapEvents(map, MAP_STYLE_LOAD_EVENT, {
      isActive: handlers.isActive,
      ...styleHandlers,
      onClick: (event) => {
        const currentClickVersion = ++clickVersion
        handleMapClick(map, event, {
          ...handlers,
          isActive: () =>
            handlers.isActive() && currentClickVersion === clickVersion,
        })
      },
      reportError: handlers.reportError,
    })
    if (map.getStyle()) styleHandlers.onStyleLoad()

    return () => {
      isActive = false
      unsubscribe()
      map.remove()
      mapRef.current = null
    }
  }, [camera, containerRef, isReady, onMapBackgroundErrorChange])

  return mapRef
}
