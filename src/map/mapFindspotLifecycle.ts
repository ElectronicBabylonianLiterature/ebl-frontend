import type { MutableRefObject } from 'react'
import * as maplibregl from 'maplibre-gl'
import type { Map as MapLibreMap } from 'maplibre-gl'
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs'
import type { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import { INITIAL_CENTER, INITIAL_ZOOM } from 'map/mapCamera'
import { MAP_STYLE_LOAD_EVENT } from 'map/mapLayers'
import { initializeFindspotSource } from 'map/mapFindspotSource'
import {
  type FindspotMapHandlers,
  subscribeFindspotInteractions,
} from 'map/mapFindspotInteractions'
import {
  MAP_STYLE_URL,
  type MapLibreErrorEvent,
  getReportableMapError,
  isMapBackgroundLoadError,
} from 'map/mapBackgroundError'

interface FindspotMapState {
  provenances: readonly ProvenanceRecord[] | null
  isInteractionEnabled: boolean
  interactionVersion: number
  cameraResetVersion: number
  cameraResetProvenances: readonly ProvenanceRecord[] | null
}

interface FindspotMapOptions {
  getState: () => FindspotMapState
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

function initializeStyle(
  map: MapLibreMap,
  options: FindspotMapOptions,
  cameraResetVersionAtCreation: number,
): void {
  options.onBackgroundErrorChange?.(false)
  const state = options.getState()
  if (!state.provenances) return

  const resetStillOwnsLatestData =
    state.cameraResetVersion !== cameraResetVersionAtCreation &&
    state.provenances === state.cameraResetProvenances
  initializeFindspotSource(map, state.provenances, !resetStillOwnsLatestData)
}

function handleMapError(
  event: MapLibreErrorEvent,
  options: FindspotMapOptions,
): void {
  if (isMapBackgroundLoadError(event)) {
    options.onBackgroundErrorChange?.(true)
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
  const cameraResetVersionAtCreation = options.getState().cameraResetVersion
  const map = createMap(container, options)
  if (!map) return

  mapRef.current = map
  map.addControl(new maplibregl.NavigationControl(), 'top-right')
  let isActive = true
  const handlers: FindspotMapHandlers = {
    isActive: () => isActive && options.getState().isInteractionEnabled,
    getInteractionVersion: () => options.getState().interactionVersion,
    navigate: options.navigate,
    reportError: options.reportError,
  }
  const handleStyleLoad = (): void =>
    initializeStyle(map, options, cameraResetVersionAtCreation)
  const handleError = (event: MapLibreErrorEvent): void =>
    handleMapError(event, options)

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
    mapRef.current = null
  }
}
