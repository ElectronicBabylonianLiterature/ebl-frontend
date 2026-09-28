import React, { useEffect, useRef } from 'react'
import { Button } from 'react-bootstrap'
import type { ActiveMapPanel, MapPanelId } from 'map/mapPanel'

export interface MapPanelDefinition {
  readonly id: MapPanelId
  readonly label: string
  readonly isSupported: boolean
  readonly render: () => JSX.Element
}

export const MAP_PANEL_CONTAINER_ID = 'map-panel-drawer'

interface Props {
  readonly panels: readonly MapPanelDefinition[]
  readonly active: ActiveMapPanel
  readonly onToggle: (panel: MapPanelId) => void
}
export default function MapToolbar({
  panels,
  active,
  onToggle,
}: Props): JSX.Element | null {
  const buttonRefs = useRef(new Map<MapPanelId, HTMLButtonElement>())
  const previousActiveRef = useRef<ActiveMapPanel>(active)
  const supported = panels.filter((panel) => panel.isSupported)

  useEffect(() => {
    if (previousActiveRef.current !== null && active === null) {
      const previousButton = buttonRefs.current.get(previousActiveRef.current)
      if (previousButton && document.contains(previousButton)) {
        previousButton.focus()
      } else {
        buttonRefs.current.get(supported[0]?.id)?.focus()
      }
    }
    previousActiveRef.current = active
  }, [active, supported])
  if (supported.length === 0) return null

  return (
    <div
      className={`map-toolbar__bar${
        active !== null ? ' map-toolbar__bar--panel-open' : ''
      }`}
      role="group"
      aria-label="Map tools"
    >
      {supported.map((panel) => {
        const isOpen = panel.id === active

        return (
          <Button
            key={panel.id}
            ref={(node: HTMLButtonElement | null) => {
              if (node) buttonRefs.current.set(panel.id, node)
            }}
            type="button"
            size="sm"
            variant={isOpen ? 'secondary' : 'outline-secondary'}
            aria-expanded={isOpen}
            aria-controls={MAP_PANEL_CONTAINER_ID}
            onClick={() => onToggle(panel.id)}
          >
            {panel.label}
          </Button>
        )
      })}
    </div>
  )
}
