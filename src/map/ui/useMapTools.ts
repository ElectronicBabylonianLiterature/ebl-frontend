import { useCallback, useState } from 'react'
import {
  type ActiveMapPanel,
  type MapPanelId,
  toggledPanel,
} from 'map/domain/mapPanel'

export interface MapToolsController {
  readonly active: ActiveMapPanel
  readonly close: () => void
  readonly toggle: (panel: MapPanelId) => void
}

export default function useMapTools(): MapToolsController {
  const [active, setActive] = useState<ActiveMapPanel>(null)
  return {
    active,
    close: useCallback(() => setActive(null), []),
    toggle: useCallback(
      (panel: MapPanelId) =>
        setActive((current) => toggledPanel(current, panel)),
      [],
    ),
  }
}
