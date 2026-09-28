import React from 'react'
import { Link } from 'react-router-dom'
import { buildFindspotFragmentSearchLink } from 'map/mapLinks'
import type { PolygonFindspotSummary } from 'map/findspotMapData'
import type { FragmentMapDataStatus } from 'map/useFragmentMapData'

interface Props {
  readonly polygonId: string
  readonly polygonName: string | null
  readonly summary: PolygonFindspotSummary | undefined
  readonly status: FragmentMapDataStatus
  readonly onClear: () => void
}

export default function MapSelectedAreaCard({
  polygonId,
  polygonName,
  summary,
  status,
  onClear,
}: Props): JSX.Element {
  return (
    <section
      className="map-selected-area"
      aria-label="Selected excavation area"
    >
      <header className="map-selected-area__header">
        <strong>{polygonName ?? polygonId}</strong>
        <button type="button" onClick={onClear}>
          Clear
        </button>
      </header>
      <div role="status" aria-live="polite" aria-atomic="true">
        {status === 'loading' ? <p>Loading linked fragments…</p> : null}
        {status === 'error' ? (
          <p>Linked fragment data is unavailable right now.</p>
        ) : null}
        {status === 'incompatible' ? (
          <p>Linked fragment data is incompatible with this map.</p>
        ) : null}
        {status === 'not-configured' ? (
          <p>No linked fragment data is configured for this site yet.</p>
        ) : null}
        {(status === 'loaded-empty' || status === 'loaded-with-mappings') &&
        !summary ? (
          <p>No fragments are linked to this excavation area.</p>
        ) : null}
        {status === 'loaded-with-mappings' && summary ? (
          <>
            <p>
              {summary.accessibleFragmentCount}{' '}
              {summary.accessibleFragmentCount === 1
                ? 'accessible fragment'
                : 'accessible fragments'}{' '}
              across {summary.findspotCount}{' '}
              {summary.findspotCount === 1 ? 'findspot' : 'findspots'}.
            </p>
            <ul className="map-selected-area__findspots">
              {summary.findspots.map((findspot) => (
                <li key={findspot.findspotId}>
                  <Link
                    to={buildFindspotFragmentSearchLink(findspot.findspotId)}
                  >
                    {findspot.area ?? 'Findspot ' + findspot.findspotId} (
                    {findspot.accessibleFragmentCount})
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    </section>
  )
}
