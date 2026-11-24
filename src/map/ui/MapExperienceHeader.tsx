import React from 'react'
import { Button } from 'react-bootstrap'
import MapShareLink from 'map/ui/MapShareLink'

interface Props {
  readonly filterControl: React.ReactNode
  readonly layerControl: React.ReactNode
  readonly visibleSiteCount: number
  readonly onResetView: () => void
}

export default function MapExperienceHeader({
  filterControl,
  layerControl,
  visibleSiteCount,
  onResetView,
}: Props): JSX.Element {
  return (
    <header className="map-experience__topbar">
      <div className="map-experience__heading">
        <h3>Explore sites</h3>
        <p>Explore archaeological sites and excavation boundaries.</p>
      </div>
      <div className="map-experience__search">{filterControl}</div>
      <div className="map-experience__actions">
        <MapShareLink />
        <Button
          type="button"
          variant="outline-secondary"
          size="sm"
          onClick={onResetView}
        >
          Reset view
        </Button>
      </div>
      <div className="map-experience__layers">
        {layerControl}
        <span className="map-experience__marker-status" role="status">
          {visibleSiteCount} map {visibleSiteCount === 1 ? 'marker' : 'markers'}
        </span>
      </div>
    </header>
  )
}
