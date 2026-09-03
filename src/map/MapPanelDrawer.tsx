import React, { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { Button } from 'react-bootstrap'
import { MAP_PANEL_CONTAINER_ID } from './MapToolbar'

interface Props {
  readonly title: string
  readonly onClose: () => void
  readonly children: React.ReactNode
  readonly rootRef?: RefObject<HTMLElement>
}
export default function MapPanelDrawer({
  title,
  onClose,
  children,
  rootRef,
}: Props): JSX.Element {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeButtonRef.current?.focus()
  }, [])

  return (
    <section
      ref={rootRef}
      id={MAP_PANEL_CONTAINER_ID}
      className={`map-panel-drawer${
        isCollapsed ? ' map-panel-drawer--collapsed' : ''
      }`}
      aria-label={title}
    >
      <div className="map-panel-drawer__header">
        <button
          type="button"
          className="map-panel-drawer__handle"
          aria-expanded={!isCollapsed}
          aria-controls="map-panel-drawer-body"
          onClick={() => setIsCollapsed((current) => !current)}
        >
          <span className="map-panel-drawer__grip" aria-hidden="true" />
          {isCollapsed ? `Expand ${title}` : `Collapse ${title}`}
        </button>
        <strong className="map-panel-drawer__title">{title}</strong>
        <Button
          ref={closeButtonRef}
          type="button"
          variant="outline-secondary"
          size="sm"
          aria-label={`Close ${title}`}
          onClick={onClose}
        >
          Close
        </Button>
      </div>
      {isCollapsed ? null : (
        <div id="map-panel-drawer-body" className="map-panel-drawer__body">
          {children}
        </div>
      )}
    </section>
  )
}
