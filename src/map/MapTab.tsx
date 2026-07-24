import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Form } from 'react-bootstrap'
import 'maplibre-gl/dist/maplibre-gl.css'
import FragmentService from 'fragmentarium/application/FragmentService'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import Spinner from 'common/ui/Spinner'
import {
  type ActiveHistoricalOverlay,
  type HistoricalMapOverlay,
  groupHistoricalMapOverlaySeries,
  groupHistoricalMapOverlaysBySite,
  unionHistoricalOverlayBounds,
  validatedHistoricalMapOverlays,
} from './historicalOverlays'
import MapControls from './MapControls'
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

function activeOverlayDetails(
  activeOverlays: readonly ActiveHistoricalOverlay[],
  overlayById: ReadonlyMap<string, HistoricalMapOverlay>,
): readonly {
  readonly overlay: HistoricalMapOverlay
  readonly opacity: number
  readonly visible: boolean
}[] {
  return activeOverlays.flatMap((activeOverlay) => {
    const overlay = overlayById.get(activeOverlay.id)
    return overlay
      ? [
          {
            overlay,
            opacity: activeOverlay.opacity,
            visible: activeOverlay.visible,
          },
        ]
      : []
  })
}

function unionMaxZoom(
  overlays: readonly HistoricalMapOverlay[],
): number | undefined {
  const maxZooms = overlays
    .map((overlay) => overlay.maxZoom)
    .filter((zoom): zoom is number => typeof zoom === 'number')
  return maxZooms.length > 0 ? Math.min(...maxZooms) : undefined
}

export default function MapTab({ fragmentService }: Props): JSX.Element {
  const mapContainer = useRef<HTMLDivElement>(null)
  const [provenances, setProvenances] = useState<
    readonly ProvenanceRecord[] | null
  >(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('')
  const [showBoundaries, setShowBoundaries] = useState(true)
  const [showExcavationAreas, setShowExcavationAreas] = useState(false)
  const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(false)
  const [historicalMapFilter, setHistoricalMapFilter] = useState('')
  const [expandedHistoricalSiteIds, setExpandedHistoricalSiteIds] = useState(
    () => new Set<string>(),
  )
  const [activeHistoricalOverlays, setActiveHistoricalOverlays] = useState<
    readonly ActiveHistoricalOverlay[]
  >([])

  const filteredProvenances = useMemo(
    () => filterProvenances(provenances, filter),
    [provenances, filter],
  )
  const overlayById = useMemo(
    () =>
      new Map(
        validatedHistoricalMapOverlays.map((overlay) => [overlay.id, overlay]),
      ),
    [],
  )
  const activeOverlayEntries = useMemo(
    () => activeOverlayDetails(activeHistoricalOverlays, overlayById),
    [activeHistoricalOverlays, overlayById],
  )
  const activeOverlayIds = useMemo(
    () => new Set(activeHistoricalOverlays.map((overlay) => overlay.id)),
    [activeHistoricalOverlays],
  )
  const historicalOverlayGroups = useMemo(
    () => groupHistoricalMapOverlaysBySite(validatedHistoricalMapOverlays),
    [],
  )
  const historicalOverlaySeries = useMemo(
    () => groupHistoricalMapOverlaySeries(validatedHistoricalMapOverlays),
    [],
  )
  const browseHistoricalMapsForSite = (siteName: string): void => {
    const siteGroup = historicalOverlayGroups.find(
      (group) => group.siteName.toLowerCase() === siteName.toLowerCase(),
    )

    setIsLayerPanelOpen(true)
    setHistoricalMapFilter(siteName)

    if (siteGroup) {
      setExpandedHistoricalSiteIds((current) => {
        const next = new Set(current)
        next.add(siteGroup.siteId)
        return next
      })
    }
  }

  const mapRef = useFindspotMap(
    mapContainer,
    filteredProvenances,
    showBoundaries,
    activeOverlayEntries,
    showExcavationAreas,
    browseHistoricalMapsForSite,
  )
  useMapSourceData(mapRef, filteredProvenances)

  function setOverlayActive(
    overlay: HistoricalMapOverlay,
    isActive: boolean,
  ): void {
    setActiveHistoricalOverlays((current) => {
      const withoutOverlay = current.filter((entry) => entry.id !== overlay.id)
      return isActive
        ? [
            ...withoutOverlay,
            {
              id: overlay.id,
              opacity: overlay.defaultOpacity,
              visible: true,
            },
          ]
        : withoutOverlay
    })
  }

  function setOverlayOpacity(overlayId: string, opacity: number): void {
    setActiveHistoricalOverlays((current) =>
      current.map((entry) =>
        entry.id === overlayId ? { ...entry, opacity } : entry,
      ),
    )
  }

  function clearHistoricalOverlays(): void {
    setActiveHistoricalOverlays([])
  }

  function showSeries(seriesId: string): void {
    const series = historicalOverlaySeries.find(
      (entry) => entry.seriesId === seriesId,
    )
    if (!series) return

    setActiveHistoricalOverlays((current) => {
      const seriesIds = new Set(series.overlays.map((overlay) => overlay.id))
      const withoutSeries = current.filter((entry) => !seriesIds.has(entry.id))
      return [
        ...withoutSeries,
        ...series.overlays.map((overlay) => ({
          id: overlay.id,
          opacity: overlay.defaultOpacity,
          visible: true,
        })),
      ]
    })
  }

  function hideSeries(seriesId: string): void {
    const series = historicalOverlaySeries.find(
      (entry) => entry.seriesId === seriesId,
    )
    if (!series) return

    const seriesIds = new Set(series.overlays.map((overlay) => overlay.id))
    setActiveHistoricalOverlays((current) =>
      current.filter((entry) => !seriesIds.has(entry.id)),
    )
  }

  function fitToBounds(
    bounds: readonly [number, number, number, number] | null,
    maxZoom?: number,
  ): void {
    if (!bounds) return

    mapRef.current?.fitBounds([...bounds], {
      padding: 48,
      ...(maxZoom !== undefined ? { maxZoom } : {}),
    })
  }

  function zoomToOverlay(overlay: HistoricalMapOverlay): void {
    fitToBounds(overlay.bounds ?? null, overlay.maxZoom)
  }

  function zoomToActiveOverlays(): void {
    const overlays = activeOverlayEntries.map((entry) => entry.overlay)
    fitToBounds(unionHistoricalOverlayBounds(overlays), unionMaxZoom(overlays))
  }

  function zoomToSeries(seriesId: string): void {
    const series = historicalOverlaySeries.find(
      (entry) => entry.seriesId === seriesId,
    )
    if (!series) return

    fitToBounds(
      unionHistoricalOverlayBounds(series.overlays),
      unionMaxZoom(series.overlays),
    )
  }

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
      <div className="map-controls">
        <section
          className="map-controls__search"
          aria-labelledby="map-controls-search-heading"
        >
          <h2 id="map-controls-search-heading" className="map-controls__title">
            Find a site
          </h2>
          <Form.Group
            className="map-controls__search-field"
            controlId="map-site-filter"
          >
            <Form.Label>Site name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Filter by site name..."
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            />
          </Form.Group>
        </section>
      </div>
      {filteredProvenances && filteredProvenances.length === 0 ? (
        <Alert variant="info">No findspots match &ldquo;{filter}&rdquo;.</Alert>
      ) : null}
      <div className="map-tab__map-frame">
        <MapControls
          activeOverlayEntries={activeOverlayEntries}
          activeOverlayIds={activeOverlayIds}
          clearHistoricalOverlays={clearHistoricalOverlays}
          expandedSiteIds={expandedHistoricalSiteIds}
          hideSeries={hideSeries}
          historicalMapFilter={historicalMapFilter}
          historicalOverlayGroups={historicalOverlayGroups}
          historicalOverlaySeries={historicalOverlaySeries}
          isLayerPanelOpen={isLayerPanelOpen}
          setExpandedSiteIds={setExpandedHistoricalSiteIds}
          setHistoricalMapFilter={setHistoricalMapFilter}
          setIsLayerPanelOpen={setIsLayerPanelOpen}
          setOverlayActive={setOverlayActive}
          setOverlayOpacity={setOverlayOpacity}
          setShowBoundaries={setShowBoundaries}
          setShowExcavationAreas={setShowExcavationAreas}
          showBoundaries={showBoundaries}
          showExcavationAreas={showExcavationAreas}
          showSeries={showSeries}
          zoomToActiveOverlays={zoomToActiveOverlays}
          zoomToOverlay={zoomToOverlay}
          zoomToSeries={zoomToSeries}
        />
        <div
          ref={mapContainer}
          className="map-tab__container"
          aria-label="Findspot map"
        />
      </div>
    </div>
  )
}
