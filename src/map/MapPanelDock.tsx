import React, { useMemo } from 'react'
import type { MutableRefObject, RefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import type { PolygonFindspotSummary } from './findspotMapData'
import type { ExcavationPolygonIndex } from './excavationPolygonIndex'
import type { MapPanelController } from './useMapPanel'
import useMapToolInteractions from './useMapToolInteractions'
import useMapElevationProfile from './useMapElevationProfile'
import { type ToolPanelsInput, useToolPanelDefinitions } from './mapToolPanels'
import {
  type InfoPanelsInput,
  buildInfoPanelDefinitions,
} from './mapInfoPanels'
import MapToolbar from './MapToolbar'
import MapPanelDrawer from './MapPanelDrawer'

export interface MapPanelDockProps {
  readonly panel: MapPanelController
  readonly mapRef: MutableRefObject<MapLibreMap | null>
  readonly drawerRef: RefObject<HTMLElement>
  readonly excavationPolygonIndex: ExcavationPolygonIndex
  readonly polygonSummaries: ReadonlyMap<string, PolygonFindspotSummary>
  readonly info: InfoPanelsInput
  readonly tools: Omit<
    ToolPanelsInput,
    'interactions' | 'excavationPolygonIndex' | 'polygonSummaries' | 'elevation'
  >
}

export default function MapPanelDock({
  panel,
  mapRef,
  drawerRef,
  excavationPolygonIndex,
  polygonSummaries,
  info,
  tools,
}: MapPanelDockProps): JSX.Element {
  const interactions = useMapToolInteractions(
    mapRef,
    excavationPolygonIndex,
    polygonSummaries,
    panel.active === 'measurement',
    panel.active === 'spatial-search',
  )

  // The profile lives beside the measurement state it reads, so it samples
  // terrain only for a line that has actually been completed.
  const elevation = useMapElevationProfile(
    mapRef,
    interactions.measurementPositions,
    tools.terrain.isEnabled,
    tools.terrain.exaggeration,
  )

  const infoPanels = useMemo(() => buildInfoPanelDefinitions(info), [info])
  const toolPanels = useToolPanelDefinitions({
    ...tools,
    excavationPolygonIndex,
    polygonSummaries,
    interactions,
    elevation,
  })
  const panels = useMemo(
    () => [...infoPanels, ...toolPanels],
    [infoPanels, toolPanels],
  )

  const activeDefinition = panels.find((entry) => entry.id === panel.active)

  return (
    <>
      <MapToolbar
        panels={panels}
        active={panel.active}
        onToggle={panel.toggle}
      />
      {activeDefinition ? (
        <MapPanelDrawer
          rootRef={drawerRef}
          title={activeDefinition.label}
          onClose={panel.close}
        >
          {activeDefinition.render()}
        </MapPanelDrawer>
      ) : null}
    </>
  )
}
