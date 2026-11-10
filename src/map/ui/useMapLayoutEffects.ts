import type { MutableRefObject, RefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import type { ActiveMapPanel } from 'map/domain/mapPanel'
import useMapPanelFootprint from 'map/ui/useMapPanelFootprint'
import useIsNarrowViewport from 'map/domain/useIsNarrowViewport'
import useMapContainerResize from 'map/ui/useMapContainerResize'
import useMapPanelPadding from 'map/ui/useMapPanelPadding'
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
