import React, { useMemo } from 'react'
import { Button, Form } from 'react-bootstrap'
import {
  type HistoricalMapOverlay,
  type HistoricalMapOverlayGroup,
  type HistoricalMapOverlaySeries,
  historicalOverlayLabel,
} from './historicalOverlays'
import ActiveHistoricalMaps, { renderSeriesControls } from './MapControlsSeries'
import type { ActiveOverlayEntry } from './historicalOverlayActions'
import {
  groupActiveCount,
  linkedExcavationAreaLabel,
  matchesHistoricalMapFilter,
  toggleExpandedSite,
} from './mapControlsHelpers'

interface Props {
  readonly activeOverlayEntries: readonly ActiveOverlayEntry[]
  readonly activeOverlayIds: ReadonlySet<string>
  readonly expandedSiteIds: ReadonlySet<string>
  readonly historicalOverlayGroups: readonly HistoricalMapOverlayGroup[]
  readonly historicalOverlaySeries: readonly HistoricalMapOverlaySeries[]
  readonly historicalMapFilter: string
  readonly linkedExcavationAreaCount: number
  readonly showBoundaries: boolean
  readonly showExcavationAreas: boolean
  readonly clearHistoricalOverlays: () => void
  readonly hideSeries: (seriesId: string) => void
  readonly setExpandedSiteIds: React.Dispatch<React.SetStateAction<Set<string>>>
  readonly setHistoricalMapFilter: (filter: string) => void
  readonly setOverlayActive: (
    overlay: HistoricalMapOverlay,
    isActive: boolean,
  ) => void
  readonly setOverlayOpacity: (overlayId: string, opacity: number) => void
  readonly setShowBoundaries: (showBoundaries: boolean) => void
  readonly setShowExcavationAreas: (showExcavationAreas: boolean) => void
  readonly showSeries: (seriesId: string) => void
  readonly zoomToActiveOverlays: () => void
  readonly zoomToOverlay: (overlay: HistoricalMapOverlay) => void
  readonly zoomToSeries: (seriesId: string) => void
}

function SiteGroup({
  group,
  controls,
}: {
  readonly group: HistoricalMapOverlayGroup
  readonly controls: Props
}): JSX.Element {
  const activeInGroup = groupActiveCount(group, controls.activeOverlayIds)
  const isExpanded =
    controls.expandedSiteIds.has(group.siteId) ||
    activeInGroup > 0 ||
    controls.historicalMapFilter.trim().length > 0
  const seriesForGroup = controls.historicalOverlaySeries.filter(
    (series) => series.overlays[0]?.siteId === group.siteId,
  )
  const seriesOverlayIds = new Set(
    seriesForGroup.flatMap((series) =>
      series.overlays.map((entry) => entry.id),
    ),
  )
  const standaloneOverlays = group.overlays.filter(
    (overlay) => !seriesOverlayIds.has(overlay.id),
  )

  return (
    <section className="map-controls__site-group">
      <button
        type="button"
        className="map-controls__site-button"
        aria-expanded={isExpanded}
        aria-label={`${group.siteName} historical maps, ${activeInGroup} of ${group.overlays.length} active`}
        onClick={() =>
          toggleExpandedSite(controls.setExpandedSiteIds, group.siteId)
        }
      >
        <span>{isExpanded ? '-' : '+'}</span>
        <strong>{group.siteName}</strong>
        <span className="map-controls__count">
          {activeInGroup}/{group.overlays.length}
        </span>
      </button>
      {isExpanded ? (
        <div className="map-controls__site-content">
          {seriesForGroup.map((series) =>
            renderSeriesControls(
              series,
              series.overlays.filter(
                (overlay) =>
                  group.overlays.some((entry) => entry.id === overlay.id) &&
                  matchesHistoricalMapFilter(
                    overlay,
                    controls.historicalMapFilter,
                  ),
              ),
              controls.activeOverlayIds,
              controls,
            ),
          )}
          {standaloneOverlays.map((overlay) => (
            <Form.Check
              key={overlay.id}
              type="checkbox"
              id={`historical-overlay-${overlay.id}`}
              label={historicalOverlayLabel(overlay)}
              checked={controls.activeOverlayIds.has(overlay.id)}
              onChange={(event) =>
                controls.setOverlayActive(overlay, event.target.checked)
              }
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}

export default function MapControls(props: Props): JSX.Element {
  const activeCount = props.activeOverlayEntries.length
  const filteredGroups = useMemo(
    () =>
      props.historicalOverlayGroups
        .map((group) => ({
          ...group,
          overlays: group.overlays.filter((overlay) =>
            matchesHistoricalMapFilter(overlay, props.historicalMapFilter),
          ),
        }))
        .filter((group) => group.overlays.length > 0),
    [props.historicalMapFilter, props.historicalOverlayGroups],
  )

  return (
    <div className="map-controls">
      <p className="map-controls__status">
        {activeCount} historical maps active · Excavation areas{' '}
        {props.showExcavationAreas ? 'on' : 'off'} · Site boundaries{' '}
        {props.showBoundaries ? 'on' : 'off'}
      </p>
      <div className="map-controls__panel">
        <div className="map-controls__section-title">Overlays</div>
        <Form.Group
          className="map-controls__historical-filter"
          controlId="historical-map-filter"
        >
          <Form.Label>Search historical maps</Form.Label>
          <Form.Control
            type="text"
            value={props.historicalMapFilter}
            placeholder="Search historical maps..."
            onChange={(event) =>
              props.setHistoricalMapFilter(event.target.value)
            }
          />
        </Form.Group>
        <div className="map-controls__scroll" aria-label="Historical maps">
          {filteredGroups.map((group) => (
            <SiteGroup key={group.siteId} group={group} controls={props} />
          ))}
        </div>
        <ActiveHistoricalMaps
          activeOverlayEntries={props.activeOverlayEntries}
          setOverlayActive={props.setOverlayActive}
          setOverlayOpacity={props.setOverlayOpacity}
          zoomToActiveOverlays={props.zoomToActiveOverlays}
          zoomToOverlay={props.zoomToOverlay}
        />
        <div className="map-controls__section-title">Map view</div>
        <div className="map-controls__display-row">
          <Form.Group
            className="map-controls__toggle"
            controlId="show-excavation-areas"
          >
            <Form.Check
              type="checkbox"
              label={
                <span className="map-controls__toggle-label">
                  <span>Show excavation areas</span>
                  {props.linkedExcavationAreaCount > 0 ? (
                    <span className="map-controls__count">
                      {linkedExcavationAreaLabel(
                        props.linkedExcavationAreaCount,
                      )}
                    </span>
                  ) : null}
                </span>
              }
              checked={props.showExcavationAreas}
              onChange={(event) =>
                props.setShowExcavationAreas(event.target.checked)
              }
            />
          </Form.Group>
          <Form.Group
            className="map-controls__toggle"
            controlId="show-site-boundaries"
          >
            <Form.Check
              type="checkbox"
              label="Show site boundaries"
              checked={props.showBoundaries}
              onChange={(event) =>
                props.setShowBoundaries(event.target.checked)
              }
            />
          </Form.Group>
        </div>
        <div className="map-controls__footer-actions">
          <Button
            type="button"
            variant="outline-secondary"
            size="sm"
            onClick={props.zoomToActiveOverlays}
            disabled={activeCount === 0}
          >
            Zoom to active maps
          </Button>
          <Button
            type="button"
            variant="outline-secondary"
            size="sm"
            onClick={props.clearHistoricalOverlays}
            disabled={activeCount === 0}
          >
            Clear maps
          </Button>
        </div>
      </div>
    </div>
  )
}
