import React, { useEffect, useRef } from 'react'
import { Button } from 'react-bootstrap'
import MapToolbar, {
  MAP_PANEL_CONTAINER_ID,
  type MapPanelDefinition,
} from 'map/ui/MapToolbar'
import type { MapToolsController } from 'map/ui/useMapTools'

interface Props {
  readonly panels: readonly MapPanelDefinition[]
  readonly panel: MapToolsController
  readonly selectionAction?: React.ReactNode
  readonly status?: React.ReactNode
}

export default function MapPanelDock({
  panels,
  panel,
  selectionAction,
  status,
}: Props): JSX.Element {
  const closeButton = useRef<HTMLButtonElement>(null)
  const activePanel = panels.find(
    (definition) => definition.id === panel.active && definition.isSupported,
  )
  const activePanelId = activePanel?.id
  useEffect(() => {
    if (activePanelId) closeButton.current?.focus()
  }, [activePanelId])

  return (
    <div className="map-research-tools">
      <MapToolbar
        panels={panels}
        active={panel.active}
        onToggle={panel.toggle}
        extraAction={selectionAction}
      />
      {status}
      {activePanel ? (
        <section
          id={MAP_PANEL_CONTAINER_ID}
          aria-label={activePanel.label}
          className="map-research-tools__panel"
          onKeyDown={(event) => {
            if (event.key === 'Escape' && !event.defaultPrevented) {
              event.stopPropagation()
              panel.close()
            }
          }}
        >
          <div className="map-research-tools__heading">
            <h4>{activePanel.label}</h4>
            <Button
              ref={closeButton}
              type="button"
              variant="outline-secondary"
              size="sm"
              aria-label={'Close ' + activePanel.label}
              onClick={panel.close}
            >
              Close
            </Button>
          </div>
          {activePanel.render()}
        </section>
      ) : null}
    </div>
  )
}
