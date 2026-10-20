import { useCallback, useMemo, useState } from 'react'
import type {
  ActiveHistoricalOverlay,
  HistoricalMapOverlay,
} from 'map/historicalOverlays'
import type { MapSelection } from 'map/mapSelection'
import type { MapVisualizationMode } from 'map/mapChoroplethScale'
import {
  DEFAULT_MAP_URL_STATE,
  type MapLayerKey,
  type MapCameraState,
  type MapUrlState,
  type MapUrlStateContext,
} from 'map/mapUrlState'
import { useInitialMapUrlState } from 'map/useMapUrlState'
import {
  withOverlayActive,
  withOverlayOpacity,
  withSeriesActive,
} from 'map/historicalOverlayActions'
import type { HistoricalMapOverlaySeries } from 'map/historicalOverlays'
import useMapTools, { type MapTools } from 'map/useMapTools'

export interface MapExperience {
  readonly requestedCamera: MapCameraState | null
  readonly tools: MapTools
  readonly selection: MapSelection | null
  readonly siteFilter: string
  readonly showBoundaries: boolean
  readonly showExcavationAreas: boolean
  readonly activeOverlays: readonly ActiveHistoricalOverlay[]
  readonly layers: readonly MapLayerKey[]
  readonly visualization: MapVisualizationMode
  readonly setVisualization: (mode: MapVisualizationMode) => void
  readonly setSelection: (selection: MapSelection | null) => void
  readonly setSiteFilter: (filter: string) => void
  readonly setShowBoundaries: (isVisible: boolean) => void
  readonly setShowExcavationAreas: (isVisible: boolean) => void
  readonly setOverlayActive: (
    overlay: HistoricalMapOverlay,
    isActive: boolean,
  ) => void
  readonly setOverlayOpacity: (overlayId: string, opacity: number) => void
  readonly setSeriesActive: (
    series: HistoricalMapOverlaySeries,
    isActive: boolean,
  ) => void
  readonly clearOverlays: () => void
  readonly reset: () => void
  readonly restore: (state: MapUrlState) => void
}

function toLayers(
  showBoundaries: boolean,
  showExcavationAreas: boolean,
): readonly MapLayerKey[] {
  return [
    ...(showBoundaries ? (['boundaries'] as const) : []),
    ...(showExcavationAreas ? (['areas'] as const) : []),
  ]
}

export default function useMapExperience(
  context: MapUrlStateContext,
): MapExperience {
  const initial = useInitialMapUrlState(context)
  const [requestedCamera, setRequestedCamera] = useState<MapCameraState | null>(
    initial.camera === DEFAULT_MAP_URL_STATE.camera ? null : initial.camera,
  )
  const [selection, setSelection] = useState(initial.selection)
  const [siteFilter, setSiteFilter] = useState(initial.siteFilter)
  const [showBoundaries, setShowBoundaries] = useState(
    initial.layers.includes('boundaries'),
  )
  const [showExcavationAreas, setShowExcavationAreas] = useState(
    initial.layers.includes('areas'),
  )
  const [activeOverlays, setActiveOverlays] = useState(initial.overlays)
  const [visualization, setVisualization] = useState(initial.visualization)
  const tools = useMapTools(initial.tools)

  const { restoreTools } = tools
  const restore = useCallback(
    (state: MapUrlState) => {
      setRequestedCamera(
        state.camera === DEFAULT_MAP_URL_STATE.camera ? null : state.camera,
      )
      setSelection(state.selection)
      setSiteFilter(state.siteFilter)
      setShowBoundaries(state.layers.includes('boundaries'))
      setShowExcavationAreas(state.layers.includes('areas'))
      setActiveOverlays(state.overlays)
      setVisualization(state.visualization)
      restoreTools(state.tools)
    },
    [restoreTools],
  )

  const reset = useCallback(() => restore(DEFAULT_MAP_URL_STATE), [restore])

  const layers = useMemo(
    () => toLayers(showBoundaries, showExcavationAreas),
    [showBoundaries, showExcavationAreas],
  )

  return {
    requestedCamera,
    tools,
    selection,
    siteFilter,
    showBoundaries,
    showExcavationAreas,
    activeOverlays,
    layers,
    visualization,
    setVisualization,
    setSelection,
    setSiteFilter,
    setShowBoundaries,
    setShowExcavationAreas,
    setOverlayActive: useCallback(
      (overlay, isActive) =>
        setActiveOverlays((current) =>
          withOverlayActive(current, overlay, isActive),
        ),
      [],
    ),
    setOverlayOpacity: useCallback(
      (overlayId, opacity) =>
        setActiveOverlays((current) =>
          withOverlayOpacity(current, overlayId, opacity),
        ),
      [],
    ),
    setSeriesActive: useCallback(
      (series, isActive) =>
        setActiveOverlays((current) =>
          withSeriesActive(current, series, isActive),
        ),
      [],
    ),
    clearOverlays: useCallback(() => setActiveOverlays([]), []),
    reset,
    restore,
  }
}
