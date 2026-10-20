import type { MutableRefObject } from 'react'
import maplibregl, { Map as MapLibreMap, MapMouseEvent } from 'maplibre-gl'
import { DEFAULT_MAP_URL_STATE } from 'map/mapUrlState'
import type { FindspotMapOptions } from 'map/useFindspotMap'

import { initializeFindspotSources } from 'map/mapSourceLifecycle'
import { syncHistoricalOverlays } from 'map/mapOverlayLifecycle'
import { applyExcavationPaint } from 'map/mapChoroplethLayers'
import {
  applyExtrusionPaint,
  setExtrusionVisibility,
} from 'map/mapExtrusionLayers'
import {
  applyFindspotSummaryState,
  applySelectionState,
  applySiteMarkerState,
} from 'map/mapFeatureState'
import {
  clearHoverState,
  handleMapClick,
  handleMapHover,
} from 'map/mapInteractions'
import {
  isBaseStyleFailure,
  MapErrorEventLike,
} from 'map/mapErrorClassification'

export const MAP_STYLE_URL =
  'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'

type Lifecycle = {
  readonly mapRef: MutableRefObject<MapLibreMap | null>
  readonly interactionVersionRef: MutableRefObject<number>
  readonly optionsRef: MutableRefObject<FindspotMapOptions>
  readonly hoveredPolygonIdRef: MutableRefObject<string | null>
  readonly activeHistoricalOverlayIdsRef: MutableRefObject<readonly string[]>
  readonly previousSelectionRef: MutableRefObject<{
    polygonId: string | null
    siteId: string | null
  }>
}

function createMap(
  container: HTMLDivElement,
  options: FindspotMapOptions,
): MapLibreMap | null {
  const camera = options.requestedCamera ?? DEFAULT_MAP_URL_STATE.camera
  try {
    return new maplibregl.Map({
      container,
      style: MAP_STYLE_URL,
      center: [...camera.center],
      zoom: camera.zoom,
      bearing: camera.bearing,
      pitch: camera.pitch,
    })
  } catch {
    options.onBaseStyleFailure()
    return null
  }
}

function initializeStyle(map: MapLibreMap, lifecycle: Lifecycle): void {
  const options = lifecycle.optionsRef.current
  syncHistoricalOverlays(
    map,
    options.activeHistoricalOverlays,
    lifecycle.activeHistoricalOverlayIdsRef,
  )
  initializeFindspotSources(
    map,
    options.provenances ?? [],
    options.showBoundaries,
    options.showExcavationAreas,
    options.requestedCamera === null,
  )
  applyExcavationPaint(map, options.excavationPaint)
  applyExtrusionPaint(map, options.excavationPaint, options.extrusionScale)
  setExtrusionVisibility(
    map,
    options.showExcavationAreas && options.isExtrusionEnabled,
  )
  applySiteMarkerState(map, options.siteMarkerStates)
  applyFindspotSummaryState(map, options.polygonVisualizationValues)
  lifecycle.previousSelectionRef.current = applySelectionState(
    map,
    options.selection,
    lifecycle.previousSelectionRef.current,
  )
}

function createClickHandler(
  map: MapLibreMap,
  lifecycle: Lifecycle,
  isCurrent: () => boolean,
): (event: MapMouseEvent) => void {
  const canSelect = (): boolean =>
    isCurrent() && lifecycle.optionsRef.current.isSelectionEnabled
  let clickVersion = 0
  return (event: MapMouseEvent): void => {
    const currentClick = ++clickVersion
    const interactionVersion = lifecycle.interactionVersionRef.current
    const isCurrentClick = (): boolean =>
      canSelect() &&
      currentClick === clickVersion &&
      interactionVersion === lifecycle.interactionVersionRef.current
    if (canSelect() && map.isStyleLoaded())
      handleMapClick(
        map,
        event,
        lifecycle.optionsRef.current.onSelectFeature,
        isCurrentClick,
        lifecycle.optionsRef.current.provenances ?? undefined,
      )
  }
}

export default function initializeFindspotMap(
  container: HTMLDivElement,
  lifecycle: Lifecycle,
): (() => void) | undefined {
  const map = createMap(container, lifecycle.optionsRef.current)
  if (!map) return
  lifecycle.mapRef.current = map
  let disposed = false
  const isCurrent = (): boolean => !disposed && lifecycle.mapRef.current === map
  const load = (): void => {
    if (isCurrent()) initializeStyle(map, lifecycle)
  }
  const error = (event: MapErrorEventLike): void => {
    if (isCurrent() && isBaseStyleFailure(event, MAP_STYLE_URL))
      lifecycle.optionsRef.current.onBaseStyleFailure()
  }
  const click = createClickHandler(map, lifecycle, isCurrent)
  const move = (event: MapMouseEvent): void => {
    if (!isCurrent() || !map.isStyleLoaded()) return
    const options = lifecycle.optionsRef.current
    handleMapHover(
      map,
      event,
      lifecycle.hoveredPolygonIdRef,
      {
        findspotSummaries: options.polygonSummaries,
        siteSummaries: options.siteSummaries,
      },
      options.onHoverPreview,
    )
  }
  const leave = (): void => {
    if (isCurrent())
      clearHoverState(
        map,
        lifecycle.hoveredPolygonIdRef,
        lifecycle.optionsRef.current.onHoverPreview,
      )
  }
  const dispose = (): void => {
    if (disposed) return
    disposed = true
    map.off('load', load)
    map.off('error', error)
    map.off('click', click)
    map.off('mousemove', move)
    map.off('mouseleave', leave)
    if (lifecycle.mapRef.current === map) {
      lifecycle.mapRef.current = null
      lifecycle.hoveredPolygonIdRef.current = null
      lifecycle.previousSelectionRef.current = { polygonId: null, siteId: null }
      lifecycle.activeHistoricalOverlayIdsRef.current = []
    }
    map.remove()
  }
  try {
    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    map.on('load', load)
    map.on('error', error)
    map.on('click', click)
    map.on('mousemove', move)
    map.on('mouseleave', leave)
  } catch {
    dispose()
    lifecycle.optionsRef.current.onBaseStyleFailure()
  }
  return dispose
}
