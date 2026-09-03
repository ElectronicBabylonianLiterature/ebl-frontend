import { useEffect, useRef } from 'react'
import type { MutableRefObject } from 'react'
import type { Map as MapLibreMap, PaddingOptions } from 'maplibre-gl'
import {
  NO_PANEL_PADDING,
  type PanelPaddingSide,
  paddingEquals,
  panelPadding,
} from './mapPanelPadding'
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

    map.setPadding(next)
    appliedRef.current = next
  }, [mapRef, isOpen, side, sizePx])
}
