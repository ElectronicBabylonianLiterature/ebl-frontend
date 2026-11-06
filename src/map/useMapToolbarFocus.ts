import { useEffect, useRef } from 'react'
import type { MutableRefObject } from 'react'
import type { ActiveMapPanel, MapPanelId } from 'map/mapPanel'

export default function useMapToolbarFocus(
  active: ActiveMapPanel,
  firstSupportedId: MapPanelId | undefined,
): MutableRefObject<Map<MapPanelId, HTMLButtonElement>> {
  const buttonRefs = useRef(new Map<MapPanelId, HTMLButtonElement>())
  const previousActiveRef = useRef<ActiveMapPanel>(active)

  useEffect(() => {
    const previous = previousActiveRef.current
    previousActiveRef.current = active
    if (
      previous === null ||
      active !== null ||
      document.activeElement !== document.body
    ) {
      return
    }
    const previousButton = buttonRefs.current.get(previous)
    if (previousButton && document.contains(previousButton)) {
      previousButton.focus()
    } else if (firstSupportedId) {
      buttonRefs.current.get(firstSupportedId)?.focus()
    }
  }, [active, firstSupportedId])

  return buttonRefs
}
