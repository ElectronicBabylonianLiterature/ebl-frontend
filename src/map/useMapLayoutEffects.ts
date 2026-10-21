import type { MutableRefObject, RefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import type { ActiveMapPanel } from 'map/mapPanel'
import useMapPanelFootprint from 'map/useMapPanelFootprint'
import useIsNarrowViewport from 'map/useIsNarrowViewport'
import useMapContainerResize from 'map/useMapContainerResize'
import useMapPanelPadding from 'map/useMapPanelPadding'
export default function useMapLayoutEffects(
  mapContainerRef: RefObject<HTMLElement>,
  mapRef: MutableRefObject<MapLibreMap | null>,
  drawerRef: RefObject<HTMLElement>,
  activePanel: ActiveMapPanel,
): void {
  useMapContainerResize(mapContainerRef, mapRef)

  const isNarrowViewport = useIsNarrowViewport()
  const drawerSize = useMapPanelFootprint(
    mapContainerRef,
    drawerRef,
    activePanel,
  )

  useMapPanelPadding(
    mapRef,
    activePanel !== null,
    isNarrowViewport ? 'bottom' : 'right',
    isNarrowViewport ? drawerSize.height : drawerSize.width,
  )
}
