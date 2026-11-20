import { useEffect } from 'react'
import type { MapToolsController } from 'map/ui/useMapTools'

interface MapPanelAvailability {
  readonly selectedPolygonId: string | null
  readonly canShowExcavationAreas: boolean
  readonly isBackgroundUnavailable: boolean
}

export default function useMapPanelAvailability(
  { active, close }: Pick<MapToolsController, 'active' | 'close'>,
  {
    selectedPolygonId,
    canShowExcavationAreas,
    isBackgroundUnavailable,
  }: MapPanelAvailability,
): void {
  useEffect(() => {
    if (selectedPolygonId === null && active === 'inspector') close()
    if (!canShowExcavationAreas && active === 'visualization') close()
    if (
      isBackgroundUnavailable &&
      (active === 'measurement' || active === 'spatial-search')
    ) {
      close()
    }
    if (!canShowExcavationAreas && active === 'spatial-search') {
      close()
    }
  }, [
    active,
    canShowExcavationAreas,
    close,
    isBackgroundUnavailable,
    selectedPolygonId,
  ])
}
