import { useEffect, useRef } from 'react'
import type { MutableRefObject, RefObject } from 'react'
import maplibregl from 'maplibre-gl'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import { INITIAL_CENTER, INITIAL_ZOOM } from './mapCamera'
import {
  applyFindspotSummaryState,
  applySelectionState,
  applySiteMarkerState,
} from './mapFeatureState'
import type { SiteMarkerState, SiteResearchSummaries } from './mapSiteSummaries'
import type { PolygonVisualizationValues } from './mapVisualizationValues'
import { applyExcavationPaint } from './mapChoroplethLayers'
import type { ExcavationPaint } from './mapExcavationPaint'
import type { ExtrusionScale } from './mapExtrusionScale'
import {
  applyExtrusionPaint,
  pitchForExtrusion,
  setExtrusionVisibility,
} from './mapExtrusionLayers'
import prefersReducedMotion from 'common/utils/prefersReducedMotion'
import type { PolygonFindspotSummary } from './findspotMapData'
import {
  clearHoverState,
  handleMapClick,
  handleMapHover,
} from './mapInteractions'
import {
  isBaseStyleFailure,
  type MapErrorEventLike,
} from './mapErrorClassification'
import type { ActiveHistoricalMapOverlay } from './mapOverlayLifecycle'
import { syncHistoricalOverlays } from './mapOverlayLifecycle'
import {
  initializeFindspotSources,
  setBoundaryVisibility,
  setExcavationAreaVisibility,
} from './mapSourceLifecycle'
import type { MapHoverPreview, MapSelection } from './mapSelection'

export const MAP_STYLE_URL =
  'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'

export interface FindspotMapOptions {
  readonly provenances: readonly ProvenanceRecord[] | null
  readonly showBoundaries: boolean
  readonly activeHistoricalOverlays: readonly ActiveHistoricalMapOverlay[]
  readonly showExcavationAreas: boolean
  readonly polygonVisualizationValues: PolygonVisualizationValues
  readonly excavationPaint: ExcavationPaint
  readonly extrusionScale: ExtrusionScale | null
  readonly isExtrusionEnabled: boolean
  readonly polygonSummaries: ReadonlyMap<string, PolygonFindspotSummary>
  readonly siteSummaries: SiteResearchSummaries
  readonly siteMarkerStates: ReadonlyMap<string, SiteMarkerState>
  readonly selection: MapSelection | null
  readonly onSelectFeature: (selection: MapSelection) => void
  readonly onHoverPreview: (preview: MapHoverPreview | null) => void
  readonly onBaseStyleFailure: () => void
}

function useLatestRef<T>(value: T): MutableRefObject<T> {
  const ref = useRef(value)
  ref.current = value
  return ref
}

export default function useFindspotMap(
  containerRef: RefObject<HTMLDivElement>,
  options: FindspotMapOptions,
): MutableRefObject<MapLibreMap | null> {
  const {
    provenances,
    showBoundaries,
    activeHistoricalOverlays,
    showExcavationAreas,
    polygonVisualizationValues,
    excavationPaint,
    extrusionScale,
    isExtrusionEnabled,
    siteMarkerStates,
    selection,
  } = options

  const mapRef = useRef<MapLibreMap | null>(null)
  const latestOptionsRef = useLatestRef(options)
  const hoveredPolygonIdRef = useRef<string | null>(null)
  const activeHistoricalOverlayIdsRef = useRef<readonly string[]>([])
  const previousSelectionRef = useRef<{
    polygonId: string | null
    siteId: string | null
  }>({ polygonId: null, siteId: null })
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

    map.on('load', () => {
      const latest = latestOptionsRef.current
      syncHistoricalOverlays(
        map,
        latest.activeHistoricalOverlays,
        activeHistoricalOverlayIdsRef,
      )
      initializeFindspotSources(
        map,
        latest.provenances ?? [],
        latest.showBoundaries,
        latest.showExcavationAreas,
      )
      applyExcavationPaint(map, latest.excavationPaint)
      applyExtrusionPaint(map, latest.excavationPaint, latest.extrusionScale)
      setExtrusionVisibility(map, latest.isExtrusionEnabled)
      applySiteMarkerState(map, latest.siteMarkerStates)
    })
    map.on('error', (event: MapErrorEventLike) => {
      if (isBaseStyleFailure(event, MAP_STYLE_URL)) {
        latestOptionsRef.current.onBaseStyleFailure()
      }
    })
    map.on('click', (event) =>
      handleMapClick(map, event, latestOptionsRef.current.onSelectFeature),
    )
    map.on('mousemove', (event) =>
      handleMapHover(
        map,
        event,
        hoveredPolygonIdRef,
        {
          findspotSummaries: latestOptionsRef.current.polygonSummaries,
          siteSummaries: latestOptionsRef.current.siteSummaries,
        },
        latestOptionsRef.current.onHoverPreview,
      ),
    )
    map.on('mouseleave', () =>
      clearHoverState(
        map,
        hoveredPolygonIdRef,
        latestOptionsRef.current.onHoverPreview,
      ),
    )

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [containerRef, isReady, latestOptionsRef])

  useEffect(() => {
    const map = mapRef.current
    if (map?.isStyleLoaded()) {
      setBoundaryVisibility(map, showBoundaries)
    }
  }, [showBoundaries])

  useEffect(() => {
    const map = mapRef.current
    if (map?.isStyleLoaded()) {
      setExcavationAreaVisibility(map, showExcavationAreas)
    }
  }, [showExcavationAreas])

  useEffect(() => {
    const map = mapRef.current
    if (map?.isStyleLoaded()) {
      syncHistoricalOverlays(
        map,
        activeHistoricalOverlays,
        activeHistoricalOverlayIdsRef,
      )
    }
  }, [activeHistoricalOverlays])

  useEffect(() => {
    const map = mapRef.current
    if (map?.isStyleLoaded()) {
      applyFindspotSummaryState(map, polygonVisualizationValues)
    }
  }, [polygonVisualizationValues])

  useEffect(() => {
    const map = mapRef.current
    if (map?.isStyleLoaded()) {
      applyExcavationPaint(map, excavationPaint)
    }
  }, [excavationPaint])

  useEffect(() => {
    const map = mapRef.current
    if (map?.isStyleLoaded()) {
      applySiteMarkerState(map, siteMarkerStates)
    }
  }, [siteMarkerStates])

  // Metric and mode changes repaint the existing extrusion layer; the polygon
  // source and the layer itself are never recreated.
  useEffect(() => {
    const map = mapRef.current
    if (map?.isStyleLoaded()) {
      applyExtrusionPaint(map, excavationPaint, extrusionScale)
    }
  }, [excavationPaint, extrusionScale])

  useEffect(() => {
    const map = mapRef.current
    if (!map?.isStyleLoaded()) return

    setExtrusionVisibility(map, isExtrusionEnabled)
    if (isExtrusionEnabled) {
      pitchForExtrusion(map, prefersReducedMotion())
    }
  }, [isExtrusionEnabled])

  useEffect(() => {
    const map = mapRef.current
    if (map?.isStyleLoaded()) {
      previousSelectionRef.current = applySelectionState(
        map,
        selection,
        previousSelectionRef.current,
      )
    }
  }, [selection])

  return mapRef
}
