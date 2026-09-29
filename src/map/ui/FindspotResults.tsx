import React from 'react'
import { Alert } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import { buildFragmentSearchLink } from 'map/domain/mapLinks'
import { getEmptyStateMessage } from 'map/domain/findspotFilter'

interface ResultsProps {
  provenances: readonly ProvenanceRecord[]
}

export function FindspotEmptyState({
  provenances,
  filter,
}: ResultsProps & { filter: string }): JSX.Element | null {
  if (provenances.length > 0) return null

  return <Alert variant="info">{getEmptyStateMessage(filter)}</Alert>
}

export function FindspotSearchList({
  provenances,
}: ResultsProps): JSX.Element | null {
  if (provenances.length === 0) return null

  return (
    <nav
      className="map-tab__findspot-links"
      aria-label="Findspot fragment searches"
    >
      <h3 className="map-tab__findspot-links-heading">Findspot searches</h3>
      <ul>
        {provenances.map((provenance) => (
          <li key={provenance.id}>
            <Link to={buildFragmentSearchLink(provenance.longName)}>
              {provenance.longName}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
