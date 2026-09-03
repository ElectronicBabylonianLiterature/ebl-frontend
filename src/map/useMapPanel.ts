import { useCallback, useState } from 'react'
import { type ActiveMapPanel, type MapPanelId, toggledPanel } from './mapPanel'

export interface MapPanelController {
  readonly active: ActiveMapPanel
  readonly open: (panel: MapPanelId) => void
  readonly toggle: (panel: MapPanelId) => void
  readonly close: () => void
}
export default function useMapPanel(
  initial: ActiveMapPanel = null,
): MapPanelController {
  const [active, setActive] = useState<ActiveMapPanel>(initial)

  return {
    active,
    open: useCallback((panel: MapPanelId) => setActive(panel), []),
    toggle: useCallback(
      (panel: MapPanelId) =>
        setActive((current) => toggledPanel(current, panel)),
      [],
    ),
    close: useCallback(() => setActive(null), []),
  }
}
