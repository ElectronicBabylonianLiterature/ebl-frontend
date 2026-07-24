import React, { useMemo } from 'react'
import { Button, Form } from 'react-bootstrap'
import {
  type HistoricalMapOverlay,
  type HistoricalMapOverlayGroup,
  type HistoricalMapOverlaySeries,
  historicalOverlayLabel,
  isSafeOverlayUrl,
} from './historicalOverlays'

interface ActiveOverlayEntry {
  readonly overlay: HistoricalMapOverlay
  readonly opacity: number
  readonly visible: boolean
}

interface Props {
  readonly activeOverlayEntries: readonly ActiveOverlayEntry[]
  readonly activeOverlayIds: ReadonlySet<string>
  readonly expandedSiteIds: ReadonlySet<string>
  readonly historicalOverlayGroups: readonly HistoricalMapOverlayGroup[]
  readonly historicalOverlaySeries: readonly HistoricalMapOverlaySeries[]
  readonly historicalMapFilter: string
  readonly isLayerPanelOpen: boolean
  readonly showBoundaries: boolean
  readonly showExcavationAreas: boolean
  readonly clearHistoricalOverlays: () => void
  readonly hideSeries: (seriesId: string) => void
  readonly setExpandedSiteIds: React.Dispatch<React.SetStateAction<Set<string>>>
  readonly setHistoricalMapFilter: (filter: string) => void
  readonly setIsLayerPanelOpen: (isOpen: boolean) => void
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

function matchesHistoricalMapFilter(
  overlay: HistoricalMapOverlay,
  filter: string,
): boolean {
  const normalizedFilter = filter.trim().toLowerCase()
  if (!normalizedFilter) return true

  return [
    overlay.title,
    overlay.shortTitle,
    overlay.siteName,
    overlay.seriesTitle,
    overlay.plateLabel,
    overlay.sourceFilename,
  ].some((value) => value?.toLowerCase().includes(normalizedFilter))
}

function groupActiveCount(
  group: HistoricalMapOverlayGroup,
  activeOverlayIds: ReadonlySet<string>,
): number {
  return group.overlays.filter((overlay) => activeOverlayIds.has(overlay.id))
    .length
}

function toggleExpandedSite(
  setExpandedSiteIds: React.Dispatch<React.SetStateAction<Set<string>>>,
  siteId: string,
): void {
  setExpandedSiteIds((current) => {
    const next = new Set(current)
    next.has(siteId) ? next.delete(siteId) : next.add(siteId)
    return next
  })
}

function renderSeriesControls(
  series: HistoricalMapOverlaySeries,
  visibleOverlays: readonly HistoricalMapOverlay[],
  activeOverlayIds: ReadonlySet<string>,
  props: Props,
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
          onClick={() => props.showSeries(series.seriesId)}
        >
          Show series
        </Button>
        <Button
          type="button"
          variant="outline-secondary"
          size="sm"
          onClick={() => props.hideSeries(series.seriesId)}
        >
          Hide series
        </Button>
        <Button
          type="button"
          variant="outline-secondary"
          size="sm"
          onClick={() => props.zoomToSeries(series.seriesId)}
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
            props.setOverlayActive(overlay, event.target.checked)
          }
        />
      ))}
    </div>
  )
}

function ActiveHistoricalMaps({
  activeOverlayEntries,
  setOverlayActive,
  setOverlayOpacity,
  zoomToActiveOverlays,
  zoomToOverlay,
}: Pick<
  Props,
  | 'activeOverlayEntries'
  | 'setOverlayActive'
  | 'setOverlayOpacity'
  | 'zoomToActiveOverlays'
  | 'zoomToOverlay'
>): JSX.Element | null {
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
    <section className="map-controls" aria-labelledby="map-layers-heading">
      <div className="map-controls__summary">
        <div>
          <h2 id="map-layers-heading" className="map-controls__title">
            Map layers
          </h2>
          <p className="map-controls__status">
            {activeCount} historical maps active · Excavation areas{' '}
            {props.showExcavationAreas ? 'on' : 'off'} · Site boundaries{' '}
            {props.showBoundaries ? 'on' : 'off'}
          </p>
        </div>
        <Button
          type="button"
          variant="outline-secondary"
          size="sm"
          aria-expanded={props.isLayerPanelOpen}
          aria-controls="map-layer-panel"
          onClick={() => props.setIsLayerPanelOpen(!props.isLayerPanelOpen)}
        >
          {props.isLayerPanelOpen ? 'Hide' : 'Show'}
        </Button>
      </div>
      {props.isLayerPanelOpen ? (
        <div id="map-layer-panel" className="map-controls__panel" tabIndex={-1}>
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
            {filteredGroups.map((group) => {
              const originalGroup =
                props.historicalOverlayGroups.find(
                  (entry) => entry.siteId === group.siteId,
                ) ?? group
              const activeInGroup = groupActiveCount(
                originalGroup,
                props.activeOverlayIds,
              )
              const isExpanded =
                props.expandedSiteIds.has(group.siteId) ||
                activeInGroup > 0 ||
                props.historicalMapFilter.trim().length > 0
              const seriesForGroup = props.historicalOverlaySeries.filter(
                (series) => series.overlays[0]?.siteId === group.siteId,
              )
              const seriesOverlayIds = new Set(
                seriesForGroup.flatMap((series) =>
                  series.overlays.map((overlay) => overlay.id),
                ),
              )
              const standaloneOverlays = group.overlays.filter(
                (overlay) => !seriesOverlayIds.has(overlay.id),
              )

              return (
                <section
                  key={group.siteId}
                  className="map-controls__site-group"
                >
                  <button
                    type="button"
                    className="map-controls__site-button"
                    aria-expanded={isExpanded}
                    aria-label={`${group.siteName} historical maps, ${activeInGroup} of ${originalGroup.overlays.length} active`}
                    onClick={() =>
                      toggleExpandedSite(props.setExpandedSiteIds, group.siteId)
                    }
                  >
                    <span>{isExpanded ? '-' : '+'}</span>
                    <strong>{group.siteName}</strong>
                    <span className="map-controls__count">
                      {activeInGroup}/{originalGroup.overlays.length}
                    </span>
                  </button>
                  {isExpanded ? (
                    <div className="map-controls__site-content">
                      {seriesForGroup.map((series) =>
                        renderSeriesControls(
                          series,
                          series.overlays.filter(
                            (overlay) =>
                              group.overlays.some(
                                (entry) => entry.id === overlay.id,
                              ) &&
                              matchesHistoricalMapFilter(
                                overlay,
                                props.historicalMapFilter,
                              ),
                          ),
                          props.activeOverlayIds,
                          props,
                        ),
                      )}
                      {standaloneOverlays.map((overlay) => (
                        <Form.Check
                          key={overlay.id}
                          type="checkbox"
                          id={`historical-overlay-${overlay.id}`}
                          label={historicalOverlayLabel(overlay)}
                          checked={props.activeOverlayIds.has(overlay.id)}
                          onChange={(event) =>
                            props.setOverlayActive(
                              overlay,
                              event.target.checked,
                            )
                          }
                        />
                      ))}
                    </div>
                  ) : null}
                </section>
              )
            })}
          </div>
          <ActiveHistoricalMaps
            activeOverlayEntries={props.activeOverlayEntries}
            setOverlayActive={props.setOverlayActive}
            setOverlayOpacity={props.setOverlayOpacity}
            zoomToActiveOverlays={props.zoomToActiveOverlays}
            zoomToOverlay={props.zoomToOverlay}
          />
          <div className="map-controls__display-row">
            <Form.Group
              className="map-controls__toggle"
              controlId="show-excavation-areas"
            >
              <Form.Check
                type="checkbox"
                label="Show excavation areas"
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
      ) : null}
    </section>
  )
}
