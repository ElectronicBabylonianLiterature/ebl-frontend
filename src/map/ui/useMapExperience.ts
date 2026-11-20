import { useCallback } from 'react'
import useMapUrlState from 'map/ui/useMapUrlState'
import type { MapSelection } from 'map/domain/mapSelection'
import type { MapVisualizationMode } from 'map/domain/mapChoroplethScale'

export interface MapExperience {
  readonly filter: string
  readonly selection: MapSelection | null
  readonly showExcavationAreas: boolean
  readonly visualization: MapVisualizationMode
  readonly setSelection: (selection: MapSelection | null) => void
  readonly setFilter: (filter: string) => void
  readonly setShowExcavationAreas: (isVisible: boolean) => void
  readonly setVisualization: (mode: MapVisualizationMode) => void
}

export default function useMapExperience(): MapExperience {
  const { state, update } = useMapUrlState()
  return {
    filter: state.filter,
    selection: state.selection,
    showExcavationAreas: state.showExcavationAreas,
    visualization: state.visualization,
    setSelection: useCallback(
      (selection: MapSelection | null) => update({ selection }),
      [update],
    ),
    setFilter: useCallback(
      (filter: string) => {
        if (filter !== state.filter) update({ filter, selection: null })
      },
      [state.filter, update],
    ),
    setShowExcavationAreas: useCallback(
      (showExcavationAreas: boolean) => update({ showExcavationAreas }),
      [update],
    ),
    setVisualization: useCallback(
      (visualization: MapVisualizationMode) => update({ visualization }),
      [update],
    ),
  }
}
