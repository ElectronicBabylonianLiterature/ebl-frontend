import { useEffect } from 'react'
import type { MapPanelController } from 'map/useMapPanel'

export default function useMapPanelAvailability(
  panel: MapPanelController,
  closePanel: () => void,
  selectedPolygonId: string | null,
  canShowExcavationAreas: boolean,
  isBackgroundUnavailable: boolean,
): void {
  useEffect(() => {
    const active = panel.active
    const shouldClose = [
      selectedPolygonId === null && active === 'inspector',
      !canShowExcavationAreas && active === 'visualization',
      isBackgroundUnavailable &&
        (active === 'measurement' || active === 'spatial-search'),
      !canShowExcavationAreas &&
        (active === 'spatial-search' || active === 'export'),
    ].some(Boolean)
    if (shouldClose) closePanel()
  }, [
    canShowExcavationAreas,
    closePanel,
    isBackgroundUnavailable,
    panel.active,
    selectedPolygonId,
  ])
}
