import type { MutableRefObject, RefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import type { ActiveMapPanel } from './mapPanel'
import useElementSize from './useElementSize'
import useIsNarrowViewport from './useIsNarrowViewport'
import useMapContainerResize from './useMapContainerResize'
import useMapPanelPadding from './useMapPanelPadding'
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
