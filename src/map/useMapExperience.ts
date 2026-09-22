import { useCallback } from 'react'
import useMapUrlState from 'map/useMapUrlState'
import usePresentationMode, {
  type PresentationMode,
} from 'map/usePresentationMode'
import { DEFAULT_MAP_URL_STATE } from 'map/mapUrlState'
import type { MapSelection } from 'map/mapSelection'

export interface MapExperience {
  readonly filter: string
  readonly showExcavationAreas: boolean
  readonly selection: MapSelection | null
  readonly presentation: PresentationMode
  readonly setFilter: (filter: string) => void
  readonly setShowExcavationAreas: (isVisible: boolean) => void
  readonly setSelection: (selection: MapSelection | null) => void
  readonly resetState: () => void
}

export default function useMapExperience(): MapExperience {
  const { state, update } = useMapUrlState()
  const presentation = usePresentationMode()

  return {
    filter: state.filter,
    showExcavationAreas: state.showExcavationAreas,
    selection: state.selection,
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
    resetState: useCallback(
      () =>
        update({
          filter: DEFAULT_MAP_URL_STATE.filter,
          showExcavationAreas: DEFAULT_MAP_URL_STATE.showExcavationAreas,
          selection: DEFAULT_MAP_URL_STATE.selection,
        }),
      [update],
    ),
  }
}
