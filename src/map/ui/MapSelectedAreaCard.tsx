import React from 'react'
import { Link } from 'react-router-dom'
import { buildFindspotFragmentSearchLink } from 'map/domain/mapLinks'
import { findspotLabel } from 'map/domain/findspotLabel'
import type { PolygonFindspotSummary } from 'fragmentarium/domain/findspotMapData'
import type { FragmentMapDataStatus } from 'map/domain/useFragmentMapData'

interface Props {
  readonly summary: PolygonFindspotSummary | undefined
  readonly status: FragmentMapDataStatus
}

const STATUS_MESSAGES: Readonly<Record<FragmentMapDataStatus, string>> = {
  loading: 'Loading linked tablets…',
  error: 'Linked tablet data is unavailable right now.',
  incompatible: 'Linked tablet data is incompatible with this map.',
  'not-configured': 'No linked tablet data is configured for this site yet.',
  'loaded-empty': 'No tablets are linked to this excavation area.',
  'loaded-with-mappings': 'No tablets are linked to this excavation area.',
}

function linkedTabletCount(summary: PolygonFindspotSummary): string {
  const tablets =
    summary.accessibleFragmentCount === 1
      ? 'accessible tablet'
      : 'accessible tablets'
  const findspots = summary.findspotCount === 1 ? 'findspot' : 'findspots'
  return `${summary.accessibleFragmentCount} ${tablets} across ${summary.findspotCount} ${findspots}.`
}

function LinkedTabletLinks({
  summary,
}: {
  readonly summary: PolygonFindspotSummary
}): JSX.Element {
  return (
    <ul>
      {summary.findspots.map((findspot) => (
        <li key={findspot.findspotId}>
          <Link to={buildFindspotFragmentSearchLink(findspot.findspotId)}>
            {findspotLabel(findspot)} ({findspot.accessibleFragmentCount})
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default function MapSelectedAreaCard({
  summary,
  status,
}: Props): JSX.Element {
  const loadedSummary = status === 'loaded-with-mappings' ? summary : undefined
  return (
    <section className="map-linked-tablets" aria-label="Linked tablets">
      <h5>Linked tablets</h5>
      <p role="status" aria-live="polite" aria-atomic="true">
        {loadedSummary
          ? linkedTabletCount(loadedSummary)
          : STATUS_MESSAGES[status]}
      </p>
      {loadedSummary ? <LinkedTabletLinks summary={loadedSummary} /> : null}
    </section>
  )
}
