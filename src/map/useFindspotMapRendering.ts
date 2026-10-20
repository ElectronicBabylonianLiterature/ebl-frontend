import { useEffect, type MutableRefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import type { FindspotMapOptions } from 'map/useFindspotMap'
import {
  applyFindspotSummaryState,
  applySelectionState,
  applySiteMarkerState,
} from 'map/mapFeatureState'
import { applyExcavationPaint } from 'map/mapChoroplethLayers'
import {
  applyExtrusionPaint,
  pitchForExtrusion,
  setExtrusionVisibility,
} from 'map/mapExtrusionLayers'
import prefersReducedMotion from 'common/utils/prefersReducedMotion'
import { syncHistoricalOverlays } from 'map/mapOverlayLifecycle'
import {
  setBoundaryVisibility,
  setExcavationAreaVisibility,
} from 'map/mapSourceLifecycle'

type MapRef = MutableRefObject<MapLibreMap | null>
type RenderingRefs = {
  readonly activeHistoricalOverlayIdsRef: MutableRefObject<readonly string[]>
  readonly previousSelectionRef: MutableRefObject<
    ReturnType<typeof applySelectionState>
  >
}

function useMapLayerRendering(
  mapRef: MapRef,
  options: FindspotMapOptions,
  refs: RenderingRefs,
): void {
  const {
    showBoundaries,
    showExcavationAreas,
    isExtrusionEnabled,
    activeHistoricalOverlays,
    polygonVisualizationValues,
  } = options
  const { activeHistoricalOverlayIdsRef } = refs
  useEffect(() => {
    const map = mapRef.current
    if (map?.isStyleLoaded()) {
      setBoundaryVisibility(map, showBoundaries)
    }
  }, [mapRef, showBoundaries])

  useEffect(() => {
    const map = mapRef.current
    if (map?.isStyleLoaded()) {
      setExcavationAreaVisibility(map, showExcavationAreas)
      setExtrusionVisibility(map, showExcavationAreas && isExtrusionEnabled)
    }
  }, [mapRef, showExcavationAreas, isExtrusionEnabled])

  useEffect(() => {
    const map = mapRef.current
    if (map?.isStyleLoaded()) {
      syncHistoricalOverlays(
        map,
        activeHistoricalOverlays,
        activeHistoricalOverlayIdsRef,
      )
    }
  }, [mapRef, activeHistoricalOverlays, activeHistoricalOverlayIdsRef])

  useEffect(() => {
    const map = mapRef.current
    if (map?.isStyleLoaded()) {
      applyFindspotSummaryState(map, polygonVisualizationValues)
    }
  }, [mapRef, polygonVisualizationValues])
}

function useMapFeatureRendering(
  mapRef: MapRef,
  options: FindspotMapOptions,
  refs: RenderingRefs,
): void {
  const {
    excavationPaint,
    siteMarkerStates,
    extrusionScale,
    isExtrusionEnabled,
    showExcavationAreas,
    selection,
  } = options
  const { previousSelectionRef } = refs
  useEffect(() => {
    const map = mapRef.current
    if (map?.isStyleLoaded()) {
      applyExcavationPaint(map, excavationPaint)
    }
  }, [mapRef, excavationPaint])

  useEffect(() => {
    const map = mapRef.current
    if (map?.isStyleLoaded()) {
      applySiteMarkerState(map, siteMarkerStates)
    }
  }, [mapRef, siteMarkerStates])

  useEffect(() => {
    const map = mapRef.current
    if (map?.isStyleLoaded()) {
      applyExtrusionPaint(map, excavationPaint, extrusionScale)
    }
  }, [mapRef, excavationPaint, extrusionScale])

  useEffect(() => {
    const map = mapRef.current
    if (!map?.isStyleLoaded()) return

    setExtrusionVisibility(map, showExcavationAreas && isExtrusionEnabled)
    if (isExtrusionEnabled && showExcavationAreas) {
      pitchForExtrusion(map, prefersReducedMotion())
    }
  }, [mapRef, isExtrusionEnabled, showExcavationAreas])

  useEffect(() => {
    const map = mapRef.current
    if (map?.isStyleLoaded()) {
      previousSelectionRef.current = applySelectionState(
        map,
        selection,
        previousSelectionRef.current,
      )
    }
  }, [mapRef, selection, previousSelectionRef])
}

export default function useFindspotMapRendering(
  mapRef: MapRef,
  options: FindspotMapOptions,
  refs: RenderingRefs,
): void {
  useMapLayerRendering(mapRef, options, refs)
  useMapFeatureRendering(mapRef, options, refs)
}
