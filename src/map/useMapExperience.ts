import { useCallback } from 'react'
import useMapUrlState from 'map/useMapUrlState'
import usePresentationMode, {
  type PresentationMode,
} from 'map/usePresentationMode'
import { DEFAULT_MAP_URL_STATE } from 'map/mapUrlState'

export interface MapExperience {
  readonly filter: string
  readonly showExcavationAreas: boolean
  readonly presentation: PresentationMode
  readonly setFilter: (filter: string) => void
  readonly setShowExcavationAreas: (isVisible: boolean) => void
  readonly resetState: () => void
}

export default function useMapExperience(): MapExperience {
  const { state, update } = useMapUrlState()
  const presentation = usePresentationMode()

  return {
    filter: state.filter,
    showExcavationAreas: state.showExcavationAreas,
    presentation,
    setFilter: useCallback((filter: string) => update({ filter }), [update]),
    setShowExcavationAreas: useCallback(
      (showExcavationAreas: boolean) => update({ showExcavationAreas }),
      [update],
    ),
    resetState: useCallback(
      () =>
        update({
          filter: DEFAULT_MAP_URL_STATE.filter,
          showExcavationAreas: DEFAULT_MAP_URL_STATE.showExcavationAreas,
        }),
      [update],
    ),
  }
}
