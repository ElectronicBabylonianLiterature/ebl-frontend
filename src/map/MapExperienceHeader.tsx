import React from 'react'
import { Button } from 'react-bootstrap'
import MapShareLink from 'map/MapShareLink'

interface Props {
  readonly filterControl: React.ReactNode
  readonly visibleSiteCount: number
  readonly onResetView: () => void
  readonly onEnterPresentation: () => void
}

export default function MapExperienceHeader({
  filterControl,
  visibleSiteCount,
  onResetView,
  onEnterPresentation,
}: Props): JSX.Element {
  return (
    <header className="map-experience__topbar">
      <div className="map-experience__heading">
        <span>eBL interactive map</span>
        <h1>Archaeological atlas</h1>
      </div>
      <div className="map-experience__search">{filterControl}</div>
      <div className="map-experience__actions">
        <span aria-live="polite">{visibleSiteCount} visible findspots</span>
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
