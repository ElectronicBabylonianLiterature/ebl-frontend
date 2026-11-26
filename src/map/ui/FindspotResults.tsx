import React from 'react'
import { Alert, Button } from 'react-bootstrap'
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

  return (
    <Alert variant="info" role="status">
      {getEmptyStateMessage(filter)}
    </Alert>
  )
}

export function FindspotSearchList({
  provenances,
  selectedId,
  onSelect,
}: ResultsProps & {
  selectedId: string | null
  onSelect: (id: string, trigger: HTMLButtonElement) => void
}): JSX.Element {
  return (
    <nav className="map-site-browser" aria-label="Findspot tablet searches">
      <div className="map-site-browser__header">
        <h4>Browse sites</h4>
        <span>Inspect a location or search the Library by site name.</span>
      </div>
      <ul className="map-site-browser__list">
        {provenances.map((provenance) => (
          <li className="map-site-browser__item" key={provenance.id}>
            <div>
              <Link to={buildFragmentSearchLink(provenance.longName)}>
                {provenance.longName}
              </Link>
              <span className="map-site-browser__meta">
                {provenance.abbreviation}
              </span>
            </div>
            <Button
              className="map-site-browser__select"
              variant="outline-secondary"
              size="sm"
              type="button"
              aria-label={`Inspect ${provenance.longName}`}
              aria-pressed={selectedId === provenance.id}
              onClick={(event) => onSelect(provenance.id, event.currentTarget)}
            >
              {selectedId === provenance.id ? 'Selected' : 'Inspect'}
            </Button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
