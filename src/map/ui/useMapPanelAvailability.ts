import { useEffect } from 'react'
import type { MapToolsController } from 'map/ui/useMapTools'

interface MapPanelAvailability {
  readonly canShowExcavationAreas: boolean
  readonly isBackgroundUnavailable: boolean
}

export default function useMapPanelAvailability(
  { active, close }: Pick<MapToolsController, 'active' | 'close'>,
  { canShowExcavationAreas, isBackgroundUnavailable }: MapPanelAvailability,
): void {
  useEffect(() => {
    if (!canShowExcavationAreas && active === 'visualization') close()
    if (
      isBackgroundUnavailable &&
      (active === 'measurement' || active === 'spatial-search')
    ) {
      close()
    }
    if (
      !canShowExcavationAreas &&
      (active === 'spatial-search' || active === 'export')
    ) {
      close()
    }
  }, [active, canShowExcavationAreas, close, isBackgroundUnavailable])
}
