import React, { useState } from 'react'
import { Button } from 'react-bootstrap'
import type { FindspotSummary } from './mapResearchSummary'
import { countLabel } from './mapResearchLabels'
import { buildFindspotFragmentSearchLink } from './mapLinks'

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
            <strong>Findspot {findspot.findspotId}</strong>
            <small>
              {countLabel(
                findspot.accessibleFragmentCount,
                'accessible fragment',
              )}
            </small>
          </span>
          <span>View fragments</span>
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
