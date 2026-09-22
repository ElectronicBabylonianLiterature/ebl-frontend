import React from 'react'
import type { RefObject } from 'react'
import MapToolbar, { type MapPanelDefinition } from 'map/MapToolbar'
import MapPanelDrawer from 'map/MapPanelDrawer'
import type { MapPanelController } from 'map/useMapPanel'

interface Props {
  readonly panels: readonly MapPanelDefinition[]
  readonly panel: MapPanelController
  readonly drawerRef?: RefObject<HTMLElement>
}

export default function MapPanelDock({
  panels,
  panel,
  drawerRef,
}: Props): JSX.Element {
  const activePanel = panels.find(
    (definition) => definition.id === panel.active && definition.isSupported,
  )

  return (
    <div className="map-panel-dock">
      <MapToolbar
        panels={panels}
        active={panel.active}
        onToggle={panel.toggle}
      />
      {activePanel ? (
        <MapPanelDrawer
          title={activePanel.label}
          onClose={panel.close}
          rootRef={drawerRef}
        >
          {activePanel.render()}
        </MapPanelDrawer>
      ) : null}
    </div>
  )
}
