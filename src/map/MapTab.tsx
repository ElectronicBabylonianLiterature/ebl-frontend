import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import 'maplibre-gl/dist/maplibre-gl.css'
import FragmentService from 'fragmentarium/application/FragmentService'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import Spinner from 'common/ui/Spinner'
import {
  isSafeOverlayUrl,
  validatedHistoricalMapOverlays,
} from './historicalOverlays'
import useFindspotMap from './useFindspotMap'
import useMapSourceData from './useMapSourceData'
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

function getHistoricalOverlayLabel(overlay: {
  readonly title: string
  readonly shortTitle?: string
  readonly dateLabel?: string
}): string {
  return [overlay.shortTitle || overlay.title, overlay.dateLabel]
    .filter(Boolean)
    .join(' - ')
}

export default function MapTab({ fragmentService }: Props): JSX.Element {
  const mapContainer = useRef<HTMLDivElement>(null)
  const [provenances, setProvenances] = useState<
    readonly ProvenanceRecord[] | null
  >(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('')
  const [showBoundaries, setShowBoundaries] = useState(true)
  const [selectedHistoricalOverlayId, setSelectedHistoricalOverlayId] =
    useState('')
  const [historicalOverlayOpacity, setHistoricalOverlayOpacity] = useState(1)

  const filteredProvenances = useMemo(
    () => filterProvenances(provenances, filter),
    [provenances, filter],
  )
  const selectedHistoricalOverlay = useMemo(
    () =>
      validatedHistoricalMapOverlays.find(
        (overlay) => overlay.id === selectedHistoricalOverlayId,
      ) ?? null,
    [selectedHistoricalOverlayId],
  )
  const mapRef = useFindspotMap(
    mapContainer,
    filteredProvenances,
    showBoundaries,
    selectedHistoricalOverlay,
    historicalOverlayOpacity,
  )
  useMapSourceData(mapRef, filteredProvenances)

  function handleHistoricalOverlayChange(
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void {
    const overlayId = event.target.value
    const overlay =
      validatedHistoricalMapOverlays.find(
        (historicalOverlay) => historicalOverlay.id === overlayId,
      ) ?? null

    setSelectedHistoricalOverlayId(overlay?.id ?? '')
    setHistoricalOverlayOpacity(overlay?.defaultOpacity ?? 1)
  }

  function clearHistoricalOverlay(): void {
    setSelectedHistoricalOverlayId('')
    setHistoricalOverlayOpacity(1)
  }

  const historicalOverlayMetadata = selectedHistoricalOverlay
    ? [
        selectedHistoricalOverlay.dateLabel,
        selectedHistoricalOverlay.cartographer,
        selectedHistoricalOverlay.institution,
      ]
        .filter(Boolean)
        .join(' - ')
    : ''

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
      <div className="map-tab__controls">
        <Form.Group className="map-tab__search">
          <Form.Control
            type="text"
            placeholder="Filter by site name..."
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Filter findspots by name"
          />
        </Form.Group>
        <Form.Group
          className="map-tab__toggle"
          controlId="show-site-boundaries"
        >
          <Form.Check
            type="checkbox"
            label="Show site boundaries"
            checked={showBoundaries}
            onChange={(event) => setShowBoundaries(event.target.checked)}
          />
        </Form.Group>
        <Form.Group
          className="map-tab__historical-select"
          controlId="historical-map-overlay"
        >
          <Form.Label>Historical map</Form.Label>
          <Form.Select
            value={selectedHistoricalOverlayId}
            onChange={handleHistoricalOverlayChange}
            disabled={validatedHistoricalMapOverlays.length === 0}
            aria-label="Select historical map overlay"
          >
            <option value="">
              {validatedHistoricalMapOverlays.length > 0
                ? 'No historical map'
                : 'No historical maps available'}
            </option>
            {validatedHistoricalMapOverlays.map((overlay) => (
              <option key={overlay.id} value={overlay.id}>
                {getHistoricalOverlayLabel(overlay)}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        {selectedHistoricalOverlay ? (
          <>
            <Form.Group
              className="map-tab__opacity"
              controlId="historical-map-opacity"
            >
              <div className="map-tab__opacity-header">
                <Form.Label>Opacity</Form.Label>
                <span>{Math.round(historicalOverlayOpacity * 100)}%</span>
              </div>
              <Form.Range
                min={0}
                max={1}
                step={0.05}
                value={historicalOverlayOpacity}
                onChange={(event) =>
                  setHistoricalOverlayOpacity(Number(event.target.value))
                }
                aria-label="Historical map opacity"
              />
            </Form.Group>
            <Button
              type="button"
              variant="outline-secondary"
              size="sm"
              className="map-tab__clear-overlay"
              onClick={clearHistoricalOverlay}
            >
              Remove
            </Button>
          </>
        ) : null}
      </div>
      {selectedHistoricalOverlay ? (
        <aside className="map-tab__historical-details" aria-live="polite">
          <strong>{selectedHistoricalOverlay.title}</strong>
          {historicalOverlayMetadata ? (
            <span>{historicalOverlayMetadata}</span>
          ) : null}
          {selectedHistoricalOverlay.description ? (
            <span>{selectedHistoricalOverlay.description}</span>
          ) : null}
          <span>{selectedHistoricalOverlay.attribution}</span>
          {selectedHistoricalOverlay.sourceUrl &&
          isSafeOverlayUrl(selectedHistoricalOverlay.sourceUrl) ? (
            <a
              href={selectedHistoricalOverlay.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Source
            </a>
          ) : null}
        </aside>
      ) : null}
      {filteredProvenances && filteredProvenances.length === 0 ? (
        <Alert variant="info">No findspots match &ldquo;{filter}&rdquo;.</Alert>
      ) : null}
      <div
        ref={mapContainer}
        className="map-tab__container"
        aria-label="Findspot map"
      />
    </div>
  )
}
