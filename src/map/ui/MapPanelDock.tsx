import React from 'react'
import type { RefObject } from 'react'
import MapToolbar, { type MapPanelDefinition } from 'map/ui/MapToolbar'
import MapPanelDrawer from 'map/ui/MapPanelDrawer'
import type { MapPanelController } from 'map/ui/useMapPanel'

interface Props {
  readonly panels: readonly MapPanelDefinition[]
  readonly panel: MapPanelController
  readonly drawerRef?: RefObject<HTMLElement>
  readonly status?: React.ReactNode
}

export default function MapPanelDock({
  panels,
  panel,
  drawerRef,
  status,
}: Props): JSX.Element {
  const activePanel = panels.find(
    (definition) => definition.id === panel.active && definition.isSupported,
  )

  const hasTools = panels.some((definition) => definition.isSupported)
  return (
    <div
      className={`map-panel-dock${status ? ' map-panel-dock--with-status' : ''}${status && !hasTools ? ' map-panel-dock--status-only' : ''}`}
    >
      <MapToolbar
        panels={panels}
        active={panel.active}
        onToggle={panel.toggle}
      />
      {status ? <div className="map-panel-dock__status">{status}</div> : null}
      {activePanel ? (
        <MapPanelDrawer
          key={activePanel.id}
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
