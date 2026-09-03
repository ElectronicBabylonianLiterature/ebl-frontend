import React from 'react'
import { Button } from 'react-bootstrap'
import type { HistoricalMapOverlay } from './historicalOverlays'

interface Props {
  readonly siteName: string
  readonly overlays: readonly HistoricalMapOverlay[]
  readonly activeOverlayIds: ReadonlySet<string>
  readonly onToggleOverlay: (
    overlay: HistoricalMapOverlay,
    isActive: boolean,
  ) => void
  readonly onCompare: () => void
}

/**
 * Historical sheets are listed as available *for the site*, never as attached
 * to the selected polygon: no mapping relation between a sheet and a single
 * excavation area exists in the data, and claiming one would be an invention.
 */
export default function MapInspectorMaps({
  siteName,
  overlays,
  activeOverlayIds,
  onToggleOverlay,
  onCompare,
}: Props): JSX.Element {
  if (overlays.length === 0) {
    return <p>No historical maps are available for {siteName}.</p>
  }

  return (
    <div className="map-inspector__maps">
      <p className="map-inspector__maps-heading">
        Historical maps available for {siteName}
      </p>
      <ul className="map-inspector__map-list">
        {overlays.map((overlay) => {
          const isActive = activeOverlayIds.has(overlay.id)

          return (
            <li key={overlay.id} className="map-inspector__map-row">
              <span>
                <strong>{overlay.shortTitle ?? overlay.title}</strong>
                {overlay.dateLabel ? <small>{overlay.dateLabel}</small> : null}
                <small className="map-inspector__attribution">
                  {overlay.attribution}
                </small>
              </span>
              <Button
                type="button"
                variant={isActive ? 'secondary' : 'outline-secondary'}
                size="sm"
                aria-pressed={isActive}
                onClick={() => onToggleOverlay(overlay, !isActive)}
              >
                {isActive ? 'Hide' : 'Show'}
              </Button>
            </li>
          )
        })}
      </ul>
      <Button
        type="button"
        variant="outline-secondary"
        size="sm"
        onClick={onCompare}
      >
        Compare historical maps
      </Button>
    </div>
  )
}
