import { useEffect, useRef } from 'react'
import type { MutableRefObject, RefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import type {
  SiteMarkerState,
  SiteResearchSummaries,
} from 'map/mapSiteSummaries'
import type { PolygonVisualizationValues } from 'map/mapVisualizationValues'
import type { ExcavationPaint } from 'map/mapExcavationPaint'
import type { ExtrusionScale } from 'map/mapExtrusionScale'
import type { PolygonFindspotSummary } from 'map/findspotMapData'
import type { ActiveHistoricalMapOverlay } from 'map/mapOverlayLifecycle'
import type { MapHoverPreview, MapSelection } from 'map/mapSelection'
import type { MapCameraState } from 'map/mapUrlState'
import initializeFindspotMap from 'map/mapFindspotLifecycle'
import useFindspotMapRendering from 'map/useFindspotMapRendering'

export { MAP_STYLE_URL } from 'map/mapFindspotLifecycle'

export interface FindspotMapOptions {
  readonly requestedCamera: MapCameraState | null
  readonly isSelectionEnabled: boolean
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
  const interactionVersionRef = useRef(0)
  const selectionEnabledRef = useRef(options.isSelectionEnabled)
  if (selectionEnabledRef.current !== options.isSelectionEnabled) {
    selectionEnabledRef.current = options.isSelectionEnabled
    interactionVersionRef.current += 1
  }
  const mapRef = useRef<MapLibreMap | null>(null)
  const latestOptionsRef = useLatestRef(options)
  const hoveredPolygonIdRef = useRef<string | null>(null)
  const activeHistoricalOverlayIdsRef = useRef<readonly string[]>([])
  const previousSelectionRef = useRef<{
    polygonId: string | null
    siteId: string | null
  }>({ polygonId: null, siteId: null })
  const isReady = options.provenances !== null

  useEffect(() => {
    if (!containerRef.current || !isReady) return

    return initializeFindspotMap(containerRef.current, {
      mapRef,
      interactionVersionRef,
      optionsRef: latestOptionsRef,
      hoveredPolygonIdRef,
      activeHistoricalOverlayIdsRef,
      previousSelectionRef,
    })
  }, [containerRef, isReady, latestOptionsRef])

  useFindspotMapRendering(mapRef, options, {
    activeHistoricalOverlayIdsRef,
    previousSelectionRef,
  })

  return mapRef
}
