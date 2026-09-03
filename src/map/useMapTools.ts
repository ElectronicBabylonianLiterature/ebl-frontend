import { useCallback, useMemo, useState } from 'react'
import {
  type ComparisonMode,
  type ComparisonSide,
  type ComparisonState,
  withMode,
  withSide,
  withSolo,
  withBlendPosition,
} from './mapComparison'
import type { PublicationTimelineState } from './overlayTimelineFilter'
import {
  DEFAULT_MAP_TOOL_URL_STATE,
  type MapToolUrlState,
} from './mapToolUrlState'
import {
  type Map3dState,
  type MapDimensionMode,
  type MapExtrusionMetric,
  clampExtrusionScale,
  clampTerrainExaggeration,
} from './map3dState'

/**
 * Per-tool settings only — terrain on/off, the comparison configuration and
 * the timeline filter. Which panel is open lives in `useMapPanel` instead, so
 * a tool stays configured (e.g. terrain enabled) while its panel is closed.
 */
export interface MapTools extends MapToolUrlState {
  readonly setTerrain: (isEnabled: boolean) => void
  readonly setComparisonMode: (mode: ComparisonMode) => void
  readonly setComparisonSide: (
    side: ComparisonSide,
    overlayId: string | null,
  ) => void
  readonly setBlendPosition: (position: number) => void
  readonly toggleSolo: (side: ComparisonSide) => void
  readonly setTimeline: (timeline: PublicationTimelineState) => void
  readonly setDimensionMode: (mode: MapDimensionMode) => void
  readonly setExtrusionMetric: (metric: MapExtrusionMetric) => void
  readonly setExtrusionScale: (scale: number) => void
  readonly setTerrainExaggeration: (exaggeration: number) => void
  readonly setHillshadeVisible: (isVisible: boolean) => void
  readonly restoreTools: (state: MapToolUrlState) => void
  readonly resetTools: () => void
}

export default function useMapTools(initial: MapToolUrlState): MapTools {
  const [terrain, setTerrain] = useState(initial.terrain)
  const [comparison, setComparison] = useState(initial.comparison)
  const [timeline, setTimeline] = useState(initial.timeline)
  const [threeD, setThreeD] = useState(initial.threeD)

  const updateThreeD = useCallback(
    (update: (current: Map3dState) => Map3dState) => setThreeD(update),
    [],
  )

  /**
   * The view selector is the only place terrain and extrusion are set together,
   * which is what keeps terrain's single source of truth (`terrain`, URL `t`)
   * consistent with the derived dimension mode.
   */
  const setDimensionMode = useCallback(
    (mode: MapDimensionMode) => {
      setTerrain(mode !== '2d')
      updateThreeD((current) => ({
        ...current,
        isExtrusionEnabled: mode === 'extrusion',
      }))
    },
    [updateThreeD],
  )

  const updateComparison = useCallback(
    (update: (current: ComparisonState) => ComparisonState) =>
      setComparison(update),
    [],
  )

  const restoreTools = useCallback((state: MapToolUrlState) => {
    setTerrain(state.terrain)
    setComparison(state.comparison)
    setTimeline(state.timeline)
    setThreeD(state.threeD)
  }, [])

  return useMemo(
    () => ({
      terrain,
      comparison,
      timeline,
      threeD,
      setTerrain,
      setComparisonMode: (mode: ComparisonMode) =>
        updateComparison((current) => withMode(current, mode)),
      setComparisonSide: (side: ComparisonSide, overlayId: string | null) =>
        updateComparison((current) => withSide(current, side, overlayId)),
      setBlendPosition: (position: number) =>
        updateComparison((current) => withBlendPosition(current, position)),
      toggleSolo: (side: ComparisonSide) =>
        updateComparison((current) => withSolo(current, side)),
      setTimeline,
      setDimensionMode,
      setExtrusionMetric: (metric: MapExtrusionMetric) =>
        updateThreeD((current) => ({ ...current, extrusionMetric: metric })),
      setExtrusionScale: (scale: number) =>
        updateThreeD((current) => ({
          ...current,
          extrusionScale: clampExtrusionScale(scale),
        })),
      setTerrainExaggeration: (exaggeration: number) =>
        updateThreeD((current) => ({
          ...current,
          terrainExaggeration: clampTerrainExaggeration(exaggeration),
        })),
      setHillshadeVisible: (isVisible: boolean) =>
        updateThreeD((current) => ({
          ...current,
          hillshadeVisible: isVisible,
        })),
      restoreTools,
      resetTools: () => restoreTools(DEFAULT_MAP_TOOL_URL_STATE),
    }),
    [
      terrain,
      comparison,
      timeline,
      threeD,
      updateComparison,
      updateThreeD,
      setDimensionMode,
      restoreTools,
    ],
  )
}
