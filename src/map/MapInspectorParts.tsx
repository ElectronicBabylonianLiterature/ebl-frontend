import {
  fragmentDataStatusText,
  type MapSiteCapabilities,
} from 'map/mapSiteCapabilities'
import { findspotLabel } from 'map/findspotLabel'
import React, { useState } from 'react'
import { Button } from 'react-bootstrap'
import type { FindspotSummary } from 'map/mapResearchSummary'
import { countLabel } from 'map/mapResearchLabels'
import { buildFindspotFragmentSearchLink } from 'map/mapLinks'

const COLLAPSED_FINDSPOT_COUNT = 6

export function plural(
  value: number,
  singular: string,
  pluralLabel = `${singular}s`,
): string {
  return value === 1 ? `${value} ${singular}` : `${value} ${pluralLabel}`
}

export function InspectorMetric({
  label,
  value,
}: {
  readonly label: string
  readonly value: string | number
}): JSX.Element {
  return (
    <div className="map-inspector__metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

/**
 * Evidence states are named in the badge itself, never signalled by colour
 * alone — the modifier class only tints a mark that already reads as text.
 */
export function InspectorBadge({
  label,
  tone,
}: {
  readonly label: string
  readonly tone: string
}): JSX.Element {
  return (
    <span className={`map-inspector__badge map-inspector__badge--${tone}`}>
      {label}
    </span>
  )
}

export function InspectorBackButton({
  onClick,
}: {
  readonly onClick: () => void
}): JSX.Element {
  return (
    <Button
      type="button"
      variant="outline-secondary"
      size="sm"
      onClick={onClick}
    >
      Back to explore
    </Button>
  )
}

/**
 * Only the first few rows are rendered until the reader asks for the rest, so
 * a polygon with hundreds of findspots costs nothing to select.
 */
export function FindspotRows({
  findspots,
}: {
  readonly findspots: readonly FindspotSummary[]
}): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false)
  const visibleFindspots = isExpanded
    ? findspots
    : findspots.slice(0, COLLAPSED_FINDSPOT_COUNT)

  return (
    <div className="map-inspector__findspots">
      {visibleFindspots.map((findspot) => (
        <a
          key={findspot.findspotId}
          className="map-inspector__findspot-row"
          href={buildFindspotFragmentSearchLink(findspot.findspotId)}
        >
          <span>
            <strong>{findspotLabel(findspot)}</strong>
            <small>
              {countLabel(
                findspot.accessibleFragmentCount,
                'accessible tablet',
              )}
            </small>
          </span>
          <span>View tablets</span>
        </a>
      ))}
      {findspots.length > COLLAPSED_FINDSPOT_COUNT ? (
        <Button
          type="button"
          variant="outline-secondary"
          size="sm"
          onClick={() => setIsExpanded((current) => !current)}
        >
          {isExpanded ? 'Show fewer' : `Show all ${findspots.length}`}
        </Button>
      ) : null}
    </div>
  )
}

export function LinkedDataUnavailable({
  site,
}: {
  readonly site: MapSiteCapabilities | undefined
}): JSX.Element {
  return (
    <p>
      {site
        ? fragmentDataStatusText(site)
        : 'Linked tablet data is not configured for this site.'}
    </p>
  )
}
