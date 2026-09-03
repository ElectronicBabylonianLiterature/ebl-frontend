import { useCallback } from 'react'
import useMapUrlState from 'map/useMapUrlState'
import usePresentationMode, {
  type PresentationMode,
} from 'map/usePresentationMode'
import { DEFAULT_MAP_URL_STATE } from 'map/mapUrlState'
import type { MapSelection } from 'map/mapSelection'
import type { MapVisualizationMode } from 'map/mapChoroplethScale'
import type { Map3dState } from 'map/map3dState'

export interface MapExperience {
  readonly filter: string
  readonly showExcavationAreas: boolean
  readonly selection: MapSelection | null
  readonly visualization: MapVisualizationMode
  readonly terrain: boolean
  readonly map3d: Map3dState
  readonly presentation: PresentationMode
  readonly setFilter: (filter: string) => void
  readonly setShowExcavationAreas: (isVisible: boolean) => void
  readonly setSelection: (selection: MapSelection | null) => void
  readonly setVisualization: (mode: MapVisualizationMode) => void
  readonly setTerrain: (isEnabled: boolean) => void
  readonly setMap3d: (state: Map3dState) => void
  readonly resetState: () => void
}

export default function useMapExperience(): MapExperience {
  const { state, update } = useMapUrlState()
  const presentation = usePresentationMode()

  return {
    filter: state.filter,
    showExcavationAreas: state.showExcavationAreas,
    selection: state.selection,
    visualization: state.visualization,
    terrain: state.terrain,
    map3d: state.map3d,
    presentation,
    setFilter: useCallback((filter: string) => update({ filter }), [update]),
    setShowExcavationAreas: useCallback(
      (showExcavationAreas: boolean) => update({ showExcavationAreas }),
      [update],
    ),
    setSelection: useCallback(
      (selection: MapSelection | null) => update({ selection }),
      [update],
    ),
    setVisualization: useCallback(
      (visualization: MapVisualizationMode) => update({ visualization }),
      [update],
    ),
    setTerrain: useCallback(
      (terrain: boolean) => update({ terrain }),
      [update],
    ),
    setMap3d: useCallback(
      (map3d: Map3dState) => update({ map3d }),
      [update],
    ),
    resetState: useCallback(
      () =>
        update({
          filter: DEFAULT_MAP_URL_STATE.filter,
          showExcavationAreas: DEFAULT_MAP_URL_STATE.showExcavationAreas,
          selection: DEFAULT_MAP_URL_STATE.selection,
          visualization: DEFAULT_MAP_URL_STATE.visualization,
          terrain: DEFAULT_MAP_URL_STATE.terrain,
          map3d: DEFAULT_MAP_URL_STATE.map3d,
        }),
      [update],
    ),
  }
}
