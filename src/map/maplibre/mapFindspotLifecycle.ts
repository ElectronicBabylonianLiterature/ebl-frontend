import type { MutableRefObject } from 'react'
import * as maplibregl from 'maplibre-gl'
import type { Map as MapLibreMap } from 'maplibre-gl'
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs'
import type { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import { INITIAL_CENTER, INITIAL_ZOOM } from 'map/maplibre/mapCamera'
import { MAP_STYLE_LOAD_EVENT } from 'map/maplibre/mapLayers'
import { createFindspotStyleHandlers } from 'map/maplibre/mapFindspotStyle'
import type { MapCameraOwnership } from 'map/maplibre/useMapCameraOwnership'
import {
  type FindspotMapHandlers,
  subscribeFindspotInteractions,
} from 'map/maplibre/mapFindspotInteractions'
import {
  MAP_STYLE_URL,
  type MapLibreErrorEvent,
  getReportableMapError,
  isMapBackgroundLoadError,
} from 'map/maplibre/mapBackgroundError'

interface FindspotMapState {
  provenances: readonly ProvenanceRecord[] | null
  isInteractionEnabled: boolean
  interactionVersion: number
}

interface FindspotMapOptions {
  getState: () => FindspotMapState
  camera: MapCameraOwnership
  onFindspotSelect?: (id: string) => void
  onExcavationSelect?: (polygonId: string) => void
  navigate: (path: string) => void
  reportError: (error: Error) => void
  onBackgroundErrorChange?: (hasError: boolean) => void
}

function createMap(
  container: HTMLDivElement,
  options: FindspotMapOptions,
): MapLibreMap | null {
  try {
    maplibregl.setWorkerUrl(maplibreWorkerUrl)
    return new maplibregl.Map({
      container,
      style: MAP_STYLE_URL,
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
    })
  } catch (error) {
    options.reportError(
      error instanceof Error ? error : new Error(String(error)),
    )
    options.onBackgroundErrorChange?.(true)
    return null
  }
}

function handleMapError(
  event: MapLibreErrorEvent,
  options: FindspotMapOptions,
  onBackgroundErrorChange: (hasError: boolean) => void,
): void {
  if (isMapBackgroundLoadError(event)) {
    onBackgroundErrorChange(true)
    return
  }
  const reportableError = getReportableMapError(event)
  if (reportableError) options.reportError(reportableError)
}

export function initializeFindspotMap(
  container: HTMLDivElement,
  mapRef: MutableRefObject<MapLibreMap | null>,
  options: FindspotMapOptions,
): (() => void) | undefined {
  const isInitialCamera = options.camera.capture()
  const map = createMap(container, options)
  if (!map) return

  mapRef.current = map
  map.addControl(new maplibregl.NavigationControl(), 'top-right')
  let isActive = true
  const isCurrentMap = (): boolean => isActive && mapRef.current === map
  const handlers: FindspotMapHandlers = {
    isActive: () => isCurrentMap() && options.getState().isInteractionEnabled,
    isCurrentMap,
    provenances: () => options.getState().provenances,
    getInteractionVersion: () => options.getState().interactionVersion,
    camera: options.camera,
    onFindspotSelect: options.onFindspotSelect,
    onExcavationSelect: options.onExcavationSelect,
    navigate: options.navigate,
    reportError: options.reportError,
  }
  const styleHandlers = createFindspotStyleHandlers(map, {
    camera: options.camera,
    provenances: handlers.provenances,
    isInitialCamera,
    onBackgroundErrorChange: options.onBackgroundErrorChange,
  })
  const handleStyleLoad = (): void => {
    if (isCurrentMap()) styleHandlers.onStyleLoad()
  }
  const handleError = (event: MapLibreErrorEvent): void => {
    if (isCurrentMap())
      handleMapError(event, options, styleHandlers.onBackgroundErrorChange)
  }

  map.on(MAP_STYLE_LOAD_EVENT, handleStyleLoad)
  if (map.getStyle()) handleStyleLoad()
  const unsubscribeInteractions = subscribeFindspotInteractions(map, handlers)
  map.on('error', handleError)

  return () => {
    isActive = false
    map.off(MAP_STYLE_LOAD_EVENT, handleStyleLoad)
    unsubscribeInteractions()
    map.off('error', handleError)
    map.remove()
    if (mapRef.current === map) mapRef.current = null
  }
}
