import React from 'react'
import { Button, Form } from 'react-bootstrap'
import {
  type HistoricalMapOverlay,
  type HistoricalMapOverlaySeries,
  historicalOverlayLabel,
  isSafeOverlayUrl,
} from './historicalOverlays'
import type { ActiveOverlayEntry } from './historicalOverlayActions'

export interface SeriesActions {
  readonly setOverlayActive: (
    overlay: HistoricalMapOverlay,
    isActive: boolean,
  ) => void
  readonly showSeries: (seriesId: string) => void
  readonly hideSeries: (seriesId: string) => void
  readonly zoomToSeries: (seriesId: string) => void
}

export function renderSeriesControls(
  series: HistoricalMapOverlaySeries,
  visibleOverlays: readonly HistoricalMapOverlay[],
  activeOverlayIds: ReadonlySet<string>,
  actions: SeriesActions,
): JSX.Element | null {
  if (visibleOverlays.length === 0) return null

  return (
    <div key={series.seriesId} className="map-controls__series">
      <div className="map-controls__series-header">
        <strong>{series.seriesTitle}</strong>
        <span className="map-controls__count">
          {
            visibleOverlays.filter((overlay) =>
              activeOverlayIds.has(overlay.id),
            ).length
          }
          /{series.overlays.length}
        </span>
      </div>
      <div className="map-controls__series-actions">
        <Button
          type="button"
          variant="outline-secondary"
          size="sm"
          onClick={() => actions.showSeries(series.seriesId)}
        >
          Show series
        </Button>
        <Button
          type="button"
          variant="outline-secondary"
          size="sm"
          onClick={() => actions.hideSeries(series.seriesId)}
        >
          Hide series
        </Button>
        <Button
          type="button"
          variant="outline-secondary"
          size="sm"
          onClick={() => actions.zoomToSeries(series.seriesId)}
        >
          Zoom
        </Button>
      </div>
      {visibleOverlays.map((overlay) => (
        <Form.Check
          key={overlay.id}
          type="checkbox"
          id={`historical-overlay-${overlay.id}`}
          label={historicalOverlayLabel(overlay)}
          checked={activeOverlayIds.has(overlay.id)}
          onChange={(event) =>
            actions.setOverlayActive(overlay, event.target.checked)
          }
        />
      ))}
    </div>
  )
}

interface ActiveHistoricalMapsProps {
  readonly activeOverlayEntries: readonly ActiveOverlayEntry[]
  readonly setOverlayActive: (
    overlay: HistoricalMapOverlay,
    isActive: boolean,
  ) => void
  readonly setOverlayOpacity: (overlayId: string, opacity: number) => void
  readonly zoomToActiveOverlays: () => void
  readonly zoomToOverlay: (overlay: HistoricalMapOverlay) => void
}

export default function ActiveHistoricalMaps({
  activeOverlayEntries,
  setOverlayActive,
  setOverlayOpacity,
  zoomToActiveOverlays,
  zoomToOverlay,
}: ActiveHistoricalMapsProps): JSX.Element | null {
  if (activeOverlayEntries.length === 0) return null

  return (
    <section
      className="map-controls__active-overlays"
      aria-labelledby="active-historical-maps-heading"
    >
      <div className="map-controls__active-header">
        <h3 id="active-historical-maps-heading">Active historical maps</h3>
        <Button
          type="button"
          variant="outline-secondary"
          size="sm"
          onClick={zoomToActiveOverlays}
        >
          Zoom to active maps
        </Button>
      </div>
      {activeOverlayEntries.map(({ overlay, opacity }) => (
        <section key={overlay.id} className="map-controls__active-row">
          <div className="map-controls__active-title">
            <strong>{historicalOverlayLabel(overlay)}</strong>
            <span>{overlay.attribution}</span>
            {overlay.sourceUrl && isSafeOverlayUrl(overlay.sourceUrl) ? (
              <a
                href={overlay.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Source
              </a>
            ) : null}
          </div>
          <Form.Group
            className="map-controls__opacity"
            controlId={`historical-map-opacity-${overlay.id}`}
          >
            <div className="map-controls__opacity-header">
              <Form.Label>Opacity</Form.Label>
              <span>{Math.round(opacity * 100)}%</span>
            </div>
            <Form.Range
              min={0}
              max={1}
              step={0.05}
              value={opacity}
              onChange={(event) =>
                setOverlayOpacity(overlay.id, Number(event.target.value))
              }
              aria-label={`${historicalOverlayLabel(overlay)} opacity`}
            />
          </Form.Group>
          <div className="map-controls__active-actions">
            <Button
              type="button"
              variant="outline-secondary"
              size="sm"
              onClick={() => zoomToOverlay(overlay)}
              disabled={!overlay.bounds}
            >
              Zoom
            </Button>
            <Button
              type="button"
              variant="outline-secondary"
              size="sm"
              onClick={() => setOverlayActive(overlay, false)}
            >
              Remove
            </Button>
          </div>
        </section>
      ))}
    </section>
  )
}
