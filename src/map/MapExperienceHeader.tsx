import React from 'react'
import { Button, Form } from 'react-bootstrap'
import MapShareLink from './MapShareLink'

interface Props {
  readonly siteFilter: string
  readonly visibleSiteCount: number
  readonly hasSelection: boolean
  readonly onSiteFilterChange: (filter: string) => void
  readonly onClearSelection: () => void
  readonly onResetView: () => void
  readonly onEnterPresentation: () => void
}

export default function MapExperienceHeader({
  siteFilter,
  visibleSiteCount,
  hasSelection,
  onSiteFilterChange,
  onClearSelection,
  onResetView,
  onEnterPresentation,
}: Props): JSX.Element {
  return (
    <header className="map-experience__topbar">
      <div className="map-experience__heading">
        <span>eBL interactive map</span>
        <h1>Archaeological atlas</h1>
      </div>
      <Form.Group
        className="map-experience__search"
        controlId="map-site-filter"
      >
        <Form.Label>Site name</Form.Label>
        <Form.Control
          type="search"
          placeholder="Filter by site name..."
          value={siteFilter}
          onChange={(event) => onSiteFilterChange(event.target.value)}
        />
      </Form.Group>
      <div className="map-experience__actions">
        <span aria-live="polite">{visibleSiteCount} visible sites</span>
        {hasSelection ? (
          <Button
            type="button"
            variant="outline-secondary"
            size="sm"
            onClick={onClearSelection}
          >
            Clear selection
          </Button>
        ) : null}
        <MapShareLink />
        <Button
          type="button"
          variant="outline-secondary"
          size="sm"
          onClick={onEnterPresentation}
        >
          Presentation mode
        </Button>
        <Button
          type="button"
          variant="outline-secondary"
          size="sm"
          onClick={onResetView}
        >
          Reset view
        </Button>
      </div>
    </header>
  )
}
