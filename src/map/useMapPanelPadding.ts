import { useEffect, useRef } from 'react'
import type { MutableRefObject } from 'react'
import type { Map as MapLibreMap, PaddingOptions } from 'maplibre-gl'
import { captureMapFocus } from 'map/mapFocusTransition'
import {
  NO_PANEL_PADDING,
  type PanelPaddingSide,
  paddingEquals,
  panelPadding,
} from 'map/mapPanelPadding'

/**
 * Reserves screen space for the open drawer/bottom sheet so later camera
 * fits (selecting a feature, "zoom to overlay") keep it visible. MapLibre
 * applies padding through jumpTo, which cancels an active camera animation.
 */
export default function useMapPanelPadding(
  mapRef: MutableRefObject<MapLibreMap | null>,
  isOpen: boolean,
  side: PanelPaddingSide,
  sizePx: number,
): void {
  const appliedRef = useRef<PaddingOptions>(NO_PANEL_PADDING)

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const next = isOpen ? panelPadding(side, sizePx) : NO_PANEL_PADDING
    if (paddingEquals(appliedRef.current, next)) return

    const resumeFocus = captureMapFocus(map)
    map.setPadding(next)
    appliedRef.current = next
    resumeFocus?.()
  }, [mapRef, isOpen, side, sizePx])
}
