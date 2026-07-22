import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Form } from 'react-bootstrap'
import 'maplibre-gl/dist/maplibre-gl.css'
import FragmentService from 'fragmentarium/application/FragmentService'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import Spinner from 'common/ui/Spinner'
import useFindspotMap from './useFindspotMap'
import useMapSourceData from './useMapSourceData'
import { buildFragmentSearchLink } from './mapLinks'
import './MapTab.sass'

interface Props {
  fragmentService: FragmentService
}

function filterProvenances(
  provenances: readonly ProvenanceRecord[] | null,
  filter: string,
): readonly ProvenanceRecord[] | null {
  if (!provenances) return null

  const normalizedFilter = filter.trim().toLowerCase()
  return normalizedFilter
    ? provenances.filter((provenance) =>
        provenance.longName.toLowerCase().includes(normalizedFilter),
      )
    : provenances
}

export default function MapTab({ fragmentService }: Props): JSX.Element {
  const mapContainer = useRef<HTMLDivElement>(null)
  const [provenances, setProvenances] = useState<
    readonly ProvenanceRecord[] | null
  >(null)
  const [error, setError] = useState<string | null>(null)
  const [mapBackgroundError, setMapBackgroundError] = useState(false)
  const [filter, setFilter] = useState('')

  const filteredProvenances = useMemo(
    () => filterProvenances(provenances, filter),
    [provenances, filter],
  )
  const handleMapBackgroundError = useCallback(() => {
    setMapBackgroundError(true)
  }, [])
  const mapRef = useFindspotMap(
    mapContainer,
    filteredProvenances,
    handleMapBackgroundError,
  )
  useMapSourceData(mapRef, filteredProvenances)

  useEffect(() => {
    fragmentService
      .fetchProvenances()
      .then(setProvenances)
      .catch((err: Error) => setError(err.message))
  }, [fragmentService])

  if (error) {
    return <Alert variant="danger">Failed to load map data: {error}</Alert>
  }

  if (!provenances) {
    return <Spinner>Loading map data...</Spinner>
  }

  return (
    <div className="map-tab">
      <Form.Group className="map-tab__search mb-3">
        <Form.Control
          type="text"
          placeholder="Filter by site name..."
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          aria-label="Filter findspots by name"
        />
      </Form.Group>
      <p id="findspot-map-description" className="map-tab__description">
        Filter findspots by name. Matching fragment search links are available
        below the map.
      </p>
      {mapBackgroundError ? (
        <Alert variant="warning" className="map-tab__map-error">
          The map background could not be loaded. Check your connection and try
          again.
        </Alert>
      ) : null}
      {filteredProvenances && filteredProvenances.length === 0 ? (
        <Alert variant="info">No findspots match &ldquo;{filter}&rdquo;.</Alert>
      ) : null}
      <div
        ref={mapContainer}
        className="map-tab__container"
        role="region"
        aria-label="Interactive findspot map"
        aria-describedby="findspot-map-description"
      />
      {filteredProvenances && filteredProvenances.length > 0 ? (
        <nav
          className="map-tab__findspot-links"
          aria-label="Findspot fragment searches"
        >
          <h3 className="map-tab__findspot-links-heading">Findspot searches</h3>
          <ul>
            {filteredProvenances.map((provenance) => (
              <li key={provenance.id}>
                <a href={buildFragmentSearchLink(provenance.longName)}>
                  {provenance.longName}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  )
}
