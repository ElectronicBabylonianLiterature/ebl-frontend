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
import { createFindspotPopup } from 'map/createFindspotPopup'
import { focusFindspot } from 'map/focusFindspot'
import { getPopupProperties } from 'map/findspotPopupProperties'
import { getFeaturePointCoordinates } from 'map/pointCoordinates'
import { subscribeFindspotMapEvents } from 'map/mapFindspotEvents'
import {
  MAP_STYLE_LOAD_EVENT,
  SOURCE_ID,
  clusterLayer,
  unclusteredLayer,
} from 'map/mapLayers'
import { initializeFindspotSource } from 'map/mapFindspotSource'
import { queryFindspotFeatures } from 'map/mapFeatureQuery'
import { MAP_STYLE_URL } from 'map/mapBackgroundError'

const INITIAL_CENTER: [number, number] = [44.4, 33.0]
const INITIAL_ZOOM = 5

interface FindspotMapHandlers {
  isActive: () => boolean
  provenances: () => readonly ProvenanceRecord[] | null
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
  const easeToClusterCenter = (zoom?: number): void => {
    if (handlers.isActive()) {
      map.easeTo(zoom === undefined ? { center } : { center, zoom })
    }
  }

  source
    .getClusterExpansionZoom(clusterId)
    .then(easeToClusterCenter)
    .catch((error: Error) => {
      if (handlers.isActive()) handlers.reportError(error)
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
  if (findspot) {
    openFindspotPopup(map, findspot, handlers)
  }
}

export default function useFindspotMap(
  containerRef: RefObject<HTMLDivElement>,
  provenances: readonly ProvenanceRecord[] | null,
  onMapBackgroundErrorChange?: (hasError: boolean) => void,
): MutableRefObject<MapLibreMap | null> {
  const mapRef = useRef<MapLibreMap | null>(null)
  const history = useHistory()
  const errorReporter = useContext(ErrorReporterContext)
  const latestProvenancesRef = useRef(provenances)
  latestProvenancesRef.current = provenances
  const latestServicesRef = useRef({ history, errorReporter })
  latestServicesRef.current = { history, errorReporter }
  const isReady = provenances !== null

  useEffect(() => {
    if (!containerRef.current || !isReady) return

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
      provenances: () => latestProvenancesRef.current,
      navigate: (path) => latestServicesRef.current.history.push(path),
      reportError: (error) =>
        latestServicesRef.current.errorReporter.captureException(error),
    }
    const handleStyleLoad = () => {
      onMapBackgroundErrorChange?.(false)
      const loadedProvenances = latestProvenancesRef.current
      if (loadedProvenances) {
        initializeFindspotSource(map, loadedProvenances)
      }
    }
    const unsubscribe = subscribeFindspotMapEvents(map, MAP_STYLE_LOAD_EVENT, {
      isActive: handlers.isActive,
      onStyleLoad: handleStyleLoad,
      onClick: (event) => {
        const currentClickVersion = ++clickVersion
        handleMapClick(map, event, {
          ...handlers,
          isActive: () =>
            handlers.isActive() && currentClickVersion === clickVersion,
        })
      },
      reportError: handlers.reportError,
      onBackgroundErrorChange: onMapBackgroundErrorChange,
    })

    return () => {
      isActive = false
      unsubscribe()
      map.remove()
      mapRef.current = null
    }
  }, [containerRef, isReady, onMapBackgroundErrorChange])

  return mapRef
}
