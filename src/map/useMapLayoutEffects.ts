import type { MutableRefObject, RefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import type { ActiveMapPanel } from './mapPanel'
import useElementSize from './useElementSize'
import useIsNarrowViewport from './useIsNarrowViewport'
import useMapContainerResize from './useMapContainerResize'
import useMapPanelPadding from './useMapPanelPadding'

/**
 * The purely mechanical side effects a map-first layout needs: resizing the
 * MapLibre canvas when its container's own box changes, and reserving camera
 * padding for whichever side the open panel currently occupies — the right
 * drawer on desktop/tablet, the bottom sheet on mobile. Measures the panel's
 * actual rendered box rather than duplicating a size constant from Sass.
 */
export default function useMapLayoutEffects(
  mapContainerRef: RefObject<HTMLElement>,
  mapRef: MutableRefObject<MapLibreMap | null>,
  drawerRef: RefObject<HTMLElement>,
  activePanel: ActiveMapPanel,
): void {
  useMapContainerResize(mapContainerRef, mapRef)

  const isNarrowViewport = useIsNarrowViewport()
  const drawerSize = useElementSize(drawerRef, activePanel)

  useMapPanelPadding(
    mapRef,
    activePanel !== null,
    isNarrowViewport ? 'bottom' : 'right',
    isNarrowViewport ? drawerSize.height : drawerSize.width,
  )
}
