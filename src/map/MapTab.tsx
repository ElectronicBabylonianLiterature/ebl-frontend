import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { Map as MapLibreMap } from 'maplibre-gl'
import FragmentService from 'fragmentarium/application/FragmentService'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import {
  ProvenanceRecord,
  getRenderableProvenanceGeometry as getSpatialProvenanceShape,
} from 'fragmentarium/domain/Provenance'
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
import MapInspector from './MapInspector'
import type { MapHoverPreview, MapSelection } from './mapSelection'
import useFindspotMap from './useFindspotMap'
import useMapSourceData from './useMapSourceData'
import {
  aggregateFindspotMapData,
  type FindspotMapDataStatus,
} from './findspotMapData'
import './MapTab.sass'

interface Props {
  findspotService: FindspotService
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

function focusProvenanceOnMap(
  map: MapLibreMap | null,
  provenance: ProvenanceRecord | undefined,
): void {
  if (!map || !provenance) return

  const spatialShape = getSpatialProvenanceShape(provenance)
  if (!spatialShape) return

  if (spatialShape.type === 'point') {
    map.easeTo({
      center: [
        spatialShape.coordinates.longitude,
        spatialShape.coordinates.latitude,
      ],
      zoom: 9,
    })
    return
  }

  if (spatialShape.coordinates.length === 0) return

  const longitude =
    spatialShape.coordinates.reduce(
      (sum, coordinate) => sum + coordinate.longitude,
      0,
    ) / spatialShape.coordinates.length
  const latitude =
    spatialShape.coordinates.reduce(
      (sum, coordinate) => sum + coordinate.latitude,
      0,
    ) / spatialShape.coordinates.length

  map.easeTo({ center: [longitude, latitude], zoom: 9 })
}

function excavationMapDataStatusText(
  status: FindspotMapDataStatus,
  mappedFindspotCount: number,
  linkedExcavationAreaCount: number,
): string {
  if (status === 'loading' || status === 'idle') {
    return 'Loading excavation fragment data...'
  }

  if (status === 'error') {
    return 'Excavation fragment data unavailable'
  }

  if (mappedFindspotCount === 0 || linkedExcavationAreaCount === 0) {
    return 'No mapped excavation fragments available'
  }

  const findspotLabel = mappedFindspotCount === 1 ? 'findspot' : 'findspots'
  const areaLabel =
    linkedExcavationAreaCount === 1 ? 'excavation area' : 'excavation areas'

  return `${mappedFindspotCount} mapped ${findspotLabel} across ${linkedExcavationAreaCount} ${areaLabel}`
}

export default function MapTab({
  findspotService,
  fragmentService,
}: Props): JSX.Element {
  const mapContainer = useRef<HTMLDivElement>(null)
  const [provenances, setProvenances] = useState<
    readonly ProvenanceRecord[] | null
  >(null)
  const [error, setError] = useState<string | null>(null)
  const [findspotMapDataStatus, setFindspotMapDataStatus] =
    useState<FindspotMapDataStatus>('idle')
  const [polygonFindspotSummaries, setPolygonFindspotSummaries] = useState(() =>
    aggregateFindspotMapData([]),
  )
  const [mappedFindspotCount, setMappedFindspotCount] = useState(0)
  const [filter, setFilter] = useState('')
  const [showBoundaries, setShowBoundaries] = useState(true)
  const [showExcavationAreas, setShowExcavationAreas] = useState(false)
  const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(false)
  const [historicalMapFilter, setHistoricalMapFilter] = useState('')
  const [selection, setSelection] = useState<MapSelection | null>(null)
  const [hoverPreview, setHoverPreview] = useState<MapHoverPreview | null>(null)
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
  const historicalMapSiteNames = useMemo(
    () =>
      new Set(
        validatedHistoricalMapOverlays.map((overlay) =>
          overlay.siteName.toLowerCase(),
        ),
      ),
    [],
  )
  const linkedExcavationAreaCount = polygonFindspotSummaries.size
  const excavationStatusText = excavationMapDataStatusText(
    findspotMapDataStatus,
    mappedFindspotCount,
    linkedExcavationAreaCount,
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
    polygonFindspotSummaries,
    selection,
    setSelection,
    setHoverPreview,
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

  function resetMapExperience(): void {
    setFilter('')
    setSelection(null)
    setHoverPreview(null)
    clearHistoricalOverlays()
    mapRef.current?.easeTo({ center: [44.4, 33.0], zoom: 5 })
  }

  function selectSiteFromExplorer(provenanceId: string): void {
    setSelection({ type: 'site', provenanceId })
    focusProvenanceOnMap(
      mapRef.current,
      provenances?.find((provenance) => provenance.id === provenanceId),
    )
  }

  function showExcavationAreasFromInspector(): void {
    setShowExcavationAreas(true)
    setIsLayerPanelOpen(true)
  }

  useEffect(() => {
    const clearSelectionOnEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setSelection(null)
        setHoverPreview(null)
      }
    }

    window.addEventListener('keydown', clearSelectionOnEscape)
    return () => window.removeEventListener('keydown', clearSelectionOnEscape)
  }, [])

  useEffect(() => {
    fragmentService
      .fetchProvenances()
      .then(setProvenances)
      .catch((err: Error) => setError(err.message))
  }, [fragmentService])

  useEffect(() => {
    let isMounted = true
    setFindspotMapDataStatus('loading')

    findspotService
      .fetchAssurMapData()
      .then((findspots) => {
        if (!isMounted) return
        setMappedFindspotCount(findspots.length)
        setPolygonFindspotSummaries(aggregateFindspotMapData(findspots))
        setFindspotMapDataStatus('loaded')
      })
      .catch(() => {
        if (!isMounted) return
        setMappedFindspotCount(0)
        setPolygonFindspotSummaries(aggregateFindspotMapData([]))
        setFindspotMapDataStatus('error')
      })

    return () => {
      isMounted = false
    }
  }, [findspotService])

  if (error) {
    return <Alert variant="danger">Failed to load map data: {error}</Alert>
  }

  if (!provenances) {
    return <Spinner>Loading map data...</Spinner>
  }

  return (
    <div className="map-tab map-experience">
      <header className="map-experience__topbar">
        <div className="map-experience__heading">
          <span>eBL interactive map</span>
          <h1>Archaeological atlas</h1>
        </div>
        <Form.Group
          className="map-experience__search"
          controlId="map-site-filter"
        >
          <Form.Label>Site name</Form.Label>
          <Form.Control
            type="search"
            placeholder="Filter by site name..."
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          />
        </Form.Group>
        <div className="map-experience__actions">
          <span aria-live="polite">
            {filteredProvenances?.length ?? 0} visible sites
          </span>
          {selection ? (
            <Button
              type="button"
              variant="outline-secondary"
              size="sm"
              onClick={() => setSelection(null)}
            >
              Clear selection
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline-secondary"
            size="sm"
            onClick={resetMapExperience}
          >
            Reset view
          </Button>
        </div>
      </header>
      {filteredProvenances && filteredProvenances.length === 0 ? (
        <Alert variant="info">No findspots match &ldquo;{filter}&rdquo;.</Alert>
      ) : null}
      <div className="map-experience__body">
        <MapInspector
          activeHistoricalMapCount={activeOverlayEntries.length}
          excavationStatusText={excavationStatusText}
          filteredProvenances={filteredProvenances ?? []}
          historicalMapSiteNames={historicalMapSiteNames}
          linkedExcavationAreaCount={linkedExcavationAreaCount}
          mappedFindspotCount={mappedFindspotCount}
          polygonSummaries={polygonFindspotSummaries}
          provenances={provenances}
          selection={selection}
          showExcavationAreas={showExcavationAreas}
          status={findspotMapDataStatus}
          onBrowseHistoricalMaps={browseHistoricalMapsForSite}
          onClearSelection={() => setSelection(null)}
          onSelectSite={selectSiteFromExplorer}
          onShowExcavationAreas={showExcavationAreasFromInspector}
        />
        <div className="map-tab__map-frame map-stage">
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
            linkedExcavationAreaCount={linkedExcavationAreaCount}
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
          {hoverPreview ? (
            <div
              className="map-hover-tooltip"
              role="status"
              style={{ left: hoverPreview.x, top: hoverPreview.y }}
            >
              <strong>{hoverPreview.title}</strong>
              {hoverPreview.details.map((detail) => (
                <span key={detail}>{detail}</span>
              ))}
            </div>
          ) : null}
          <div className="map-legend" aria-label="Map legend">
            <span>
              <i className="map-legend__swatch map-legend__swatch--site" />
              Site
            </span>
            <span>
              <i className="map-legend__swatch map-legend__swatch--area" />
              Linked area
            </span>
            <span>
              <i className="map-legend__swatch map-legend__swatch--historical" />
              Historical map
            </span>
          </div>
          <div
            ref={mapContainer}
            className="map-tab__container"
            aria-label="Findspot map"
          />
        </div>
      </div>
    </div>
  )
}
