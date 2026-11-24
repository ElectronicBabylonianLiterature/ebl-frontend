import { useCallback } from 'react'
import useMapUrlState from 'map/ui/useMapUrlState'

export interface MapExperience {
  readonly filter: string
  readonly showExcavationAreas: boolean
  readonly setFilter: (filter: string) => void
  readonly setShowExcavationAreas: (isVisible: boolean) => void
}

export default function useMapExperience(): MapExperience {
  const { state, update } = useMapUrlState()

  return {
    filter: state.filter,
    showExcavationAreas: state.showExcavationAreas,
    setFilter: useCallback((filter: string) => update({ filter }), [update]),
    setShowExcavationAreas: useCallback(
      (showExcavationAreas: boolean) => update({ showExcavationAreas }),
      [update],
    ),
  }
}
