import { useEffect, useRef } from 'react'
import type { MutableRefObject, RefObject } from 'react'
import type { Feature, Point } from 'geojson'
import maplibregl from 'maplibre-gl'
import type {
  GeoJSONSource,
  Map as MapLibreMap,
  MapGeoJSONFeature,
  MapMouseEvent,
} from 'maplibre-gl'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import type { HistoricalMapOverlay } from './historicalOverlays'
import {
  EXCAVATION_AREA_FILL_LAYER_ID,
  EXCAVATION_AREA_OUTLINE_LAYER_ID,
  EXCAVATION_AREAS_SOURCE_ID,
  POLYGON_SOURCE_ID,
  SOURCE_ID,
  clusterCountLayer,
  clusterLayer,
  createExcavationAreasSource,
  createHistoricalRasterLayer,
  createHistoricalRasterSource,
  createFindspotPolygonsSource,
  createFindspotsSource,
  excavationAreaFillLayer,
  historicalRasterLayerId,
  historicalRasterSourceId,
  excavationAreaOutlineLayer,
  excavationAreaSelectedLayer,
  polygonFillLayer,
  polygonOutlineLayer,
  unclusteredLayer,
} from './mapLayers'
import type { PolygonFindspotSummary } from './findspotMapData'
import { provenanceToGeoJson } from './provenanceToGeoJson'
import { provenancesToPolygonGeoJson } from './provenanceToPolygonGeoJson'
import type { MapHoverPreview, MapSelection } from './mapSelection'

const MAP_STYLE_URL =
  'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'

const INITIAL_CENTER: [number, number] = [44.4, 33.0]
const INITIAL_ZOOM = 5
const INTERACTIVE_LAYER_IDS = [
  clusterLayer.id,
  unclusteredLayer.id,
  excavationAreaFillLayer.id,
  polygonFillLayer.id,
]

export function fitMapToData(
  map: MapLibreMap,
  features: readonly Feature[],
): void {
  if (features.length === 0) return

  const bounds = new maplibregl.LngLatBounds()
  for (const feature of features) {
    if (feature.geometry.type === 'Point') {
      bounds.extend(feature.geometry.coordinates as [number, number])
    }
  }

  if (!bounds.isEmpty()) {
    map.fitBounds(bounds, { padding: 40, maxZoom: 12 })
  }
}

function clampRasterOpacity(opacity: number): number {
  if (!Number.isFinite(opacity)) {
    return 1
  }

  return Math.min(Math.max(opacity, 0), 1)
}

interface ActiveHistoricalMapOverlay {
  readonly overlay: HistoricalMapOverlay
  readonly opacity: number
  readonly visible: boolean
}

function removeHistoricalOverlay(map: MapLibreMap, overlayId: string): void {
  const layerId = historicalRasterLayerId(overlayId)
  const sourceId = historicalRasterSourceId(overlayId)

  if (map.getLayer(layerId)) {
    map.removeLayer(layerId)
  }

  if (map.getSource(sourceId)) {
    map.removeSource(sourceId)
  }
}

function addHistoricalOverlay(
  map: MapLibreMap,
  activeOverlay: ActiveHistoricalMapOverlay,
): void {
  const sourceId = historicalRasterSourceId(activeOverlay.overlay.id)
  const layerId = historicalRasterLayerId(activeOverlay.overlay.id)

  if (!map.getSource(sourceId)) {
    map.addSource(sourceId, createHistoricalRasterSource(activeOverlay.overlay))
  }

  if (!map.getLayer(layerId)) {
    const layer = createHistoricalRasterLayer(
      activeOverlay.overlay,
      clampRasterOpacity(activeOverlay.opacity),
    )
    const beforeLayerId = map.getLayer(polygonFillLayer.id)
      ? polygonFillLayer.id
      : undefined

    if (beforeLayerId) {
      map.addLayer(layer, beforeLayerId)
    } else {
      map.addLayer(layer)
    }
  }
}

function syncHistoricalOverlays(
  map: MapLibreMap,
  activeOverlays: readonly ActiveHistoricalMapOverlay[],
  activeOverlayIdsRef: MutableRefObject<readonly string[]>,
): void {
  const visibleOverlays = activeOverlays.filter((entry) => entry.visible)
  const nextIds = visibleOverlays.map((entry) => entry.overlay.id)
  const nextIdSet = new Set(nextIds)

  for (const previousId of activeOverlayIdsRef.current) {
    if (!nextIdSet.has(previousId)) {
      removeHistoricalOverlay(map, previousId)
    }
  }

  for (const activeOverlay of visibleOverlays) {
    addHistoricalOverlay(map, activeOverlay)
    const layerId = historicalRasterLayerId(activeOverlay.overlay.id)
    if (map.getLayer(layerId)) {
      map.setPaintProperty(
        layerId,
        'raster-opacity',
        clampRasterOpacity(activeOverlay.opacity),
      )
    }
  }

  activeOverlayIdsRef.current = nextIds
}

function setExcavationAreaVisibility(
  map: MapLibreMap,
  isVisible: boolean,
): void {
  const visibility = isVisible ? 'visible' : 'none'

  for (const layerId of [
    EXCAVATION_AREA_FILL_LAYER_ID,
    EXCAVATION_AREA_OUTLINE_LAYER_ID,
    excavationAreaSelectedLayer.id,
  ]) {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, 'visibility', visibility)
    }
  }
}

function setBoundaryVisibility(map: MapLibreMap, isVisible: boolean): void {
  const visibility = isVisible ? 'visible' : 'none'

  for (const layerId of [polygonFillLayer.id, polygonOutlineLayer.id]) {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, 'visibility', visibility)
    }
  }
}

function initializeFindspotSources(
  map: MapLibreMap,
  provenances: readonly ProvenanceRecord[],
  showBoundaries: boolean,
  showExcavationAreas: boolean,
): void {
  const pointGeoJson = provenanceToGeoJson(provenances)
  const polygonGeoJson = provenancesToPolygonGeoJson(provenances)

  map.addSource(POLYGON_SOURCE_ID, createFindspotPolygonsSource(polygonGeoJson))
  map.addLayer(polygonFillLayer)
  map.addLayer(polygonOutlineLayer)
  setBoundaryVisibility(map, showBoundaries)

  map.addSource(EXCAVATION_AREAS_SOURCE_ID, createExcavationAreasSource())
  map.addLayer(excavationAreaFillLayer)
  map.addLayer(excavationAreaOutlineLayer)
  map.addLayer(excavationAreaSelectedLayer)
  setExcavationAreaVisibility(map, showExcavationAreas)

  map.addSource(SOURCE_ID, createFindspotsSource(pointGeoJson))
  map.addLayer(clusterLayer)
  map.addLayer(clusterCountLayer)
  map.addLayer(unclusteredLayer)
  fitMapToData(map, pointGeoJson.features)
}

function expandCluster(map: MapLibreMap, cluster: MapGeoJSONFeature): void {
  const clusterId = cluster.properties?.cluster_id
  if (typeof clusterId !== 'number') return

  const source = map.getSource(SOURCE_ID) as GeoJSONSource
  void source.getClusterExpansionZoom(clusterId).then((zoom) => {
    map.easeTo({
      center: (cluster.geometry as Point).coordinates.slice() as [
        number,
        number,
      ],
      zoom,
    })
  })
}

function extendBoundsWithCoordinates(
  bounds: maplibregl.LngLatBounds,
  coordinates: unknown,
): void {
  if (!Array.isArray(coordinates)) return

  if (
    coordinates.length >= 2 &&
    typeof coordinates[0] === 'number' &&
    typeof coordinates[1] === 'number'
  ) {
    bounds.extend([coordinates[0], coordinates[1]])
    return
  }

  coordinates.forEach((entry) => extendBoundsWithCoordinates(bounds, entry))
}

function focusFeature(map: MapLibreMap, feature: MapGeoJSONFeature): void {
  if (feature.geometry.type === 'Point') {
    map.easeTo({
      center: (feature.geometry as Point).coordinates.slice() as [
        number,
        number,
      ],
      zoom: 9,
    })
    return
  }

  if (!('coordinates' in feature.geometry)) return

  const bounds = new maplibregl.LngLatBounds()
  extendBoundsWithCoordinates(bounds, feature.geometry.coordinates)

  if (!bounds.isEmpty()) {
    map.fitBounds(bounds, {
      padding: { top: 48, right: 48, bottom: 48, left: 360 },
      maxZoom: 16,
    })
  }
}

function featureStringProperty(
  feature: MapGeoJSONFeature,
  property: string,
): string | null {
  const value = feature.properties?.[property]
  return typeof value === 'string' ? value : null
}

function setExcavationFeatureState(
  map: MapLibreMap,
  polygonId: string,
  state: Record<string, unknown>,
): void {
  map.setFeatureState(
    { source: EXCAVATION_AREAS_SOURCE_ID, id: polygonId },
    state,
  )
}

function selectedSiteId(selection: MapSelection | null): string | null {
  return selection?.type === 'site' ? selection.provenanceId : null
}

function selectedPolygonId(selection: MapSelection | null): string | null {
  return selection?.type === 'excavation-area' ? selection.polygonId : null
}

function polygonHoverPreview(
  feature: MapGeoJSONFeature,
  summary: PolygonFindspotSummary | undefined,
  x: number,
  y: number,
): MapHoverPreview | null {
  const title = featureStringProperty(feature, 'name') ?? 'Excavation area'
  if (!summary) {
    return { x, y, title, details: ['No mapped findspots', 'Click to inspect'] }
  }

  return {
    x,
    y,
    title,
    details: [
      `${summary.findspotCount} mapped ${summary.findspotCount === 1 ? 'findspot' : 'findspots'}`,
      `${summary.accessibleFragmentCount} accessible ${summary.accessibleFragmentCount === 1 ? 'fragment' : 'fragments'}`,
      'Click to inspect',
    ],
  }
}

function siteHoverPreview(
  feature: MapGeoJSONFeature,
  x: number,
  y: number,
): MapHoverPreview | null {
  const title = featureStringProperty(feature, 'name')
  if (!title) return null

  return { x, y, title, details: ['Site', 'Click to explore'] }
}

function handleMapClick(
  map: MapLibreMap,
  event: MapMouseEvent,
  onSelectFeature: (selection: MapSelection) => void,
): void {
  const [cluster] = map.queryRenderedFeatures(event.point, {
    layers: [clusterLayer.id],
  })
  if (cluster) {
    expandCluster(map, cluster)
    return
  }

  const [findspot] = map.queryRenderedFeatures(event.point, {
    layers: [unclusteredLayer.id],
  })
  if (findspot) {
    const provenanceId = featureStringProperty(findspot, 'id')
    if (provenanceId) {
      focusFeature(map, findspot)
      onSelectFeature({ type: 'site', provenanceId })
    }
    return
  }

  const [excavationArea] = map.queryRenderedFeatures(event.point, {
    layers: [excavationAreaFillLayer.id],
  })
  if (excavationArea) {
    const polygonId = featureStringProperty(excavationArea, 'id')
    if (polygonId) {
      focusFeature(map, excavationArea)
      onSelectFeature({ type: 'excavation-area', polygonId })
    }
    return
  }

  const [polygon] = map.queryRenderedFeatures(event.point, {
    layers: [polygonFillLayer.id],
  })
  if (polygon) {
    const provenanceId = featureStringProperty(polygon, 'id')
    if (provenanceId) {
      focusFeature(map, polygon)
      onSelectFeature({ type: 'site', provenanceId })
    }
  }
}

function handleMapHover(
  map: MapLibreMap,
  event: MapMouseEvent,
  hoveredPolygonIdRef: MutableRefObject<string | null>,
  findspotSummaries: ReadonlyMap<string, PolygonFindspotSummary>,
  onHoverPreview: (preview: MapHoverPreview | null) => void,
): void {
  const hasPointerTarget =
    map.queryRenderedFeatures(event.point, {
      layers: INTERACTIVE_LAYER_IDS,
    }).length > 0
  map.getCanvas().style.cursor = hasPointerTarget ? 'pointer' : ''

  const [excavationArea] = map.queryRenderedFeatures(event.point, {
    layers: [excavationAreaFillLayer.id],
  })
  const nextPolygonId = excavationArea
    ? featureStringProperty(excavationArea, 'id')
    : null
  if (
    hoveredPolygonIdRef.current &&
    hoveredPolygonIdRef.current !== nextPolygonId
  ) {
    setExcavationFeatureState(map, hoveredPolygonIdRef.current, {
      hover: false,
    })
  }
  if (nextPolygonId && hoveredPolygonIdRef.current !== nextPolygonId) {
    setExcavationFeatureState(map, nextPolygonId, { hover: true })
  }
  hoveredPolygonIdRef.current = nextPolygonId

  if (excavationArea && nextPolygonId) {
    onHoverPreview(
      polygonHoverPreview(
        excavationArea,
        findspotSummaries.get(nextPolygonId),
        event.point.x,
        event.point.y,
      ),
    )
    return
  }

  const [findspot] = map.queryRenderedFeatures(event.point, {
    layers: [unclusteredLayer.id],
  })
  onHoverPreview(
    findspot ? siteHoverPreview(findspot, event.point.x, event.point.y) : null,
  )
}

function clearHoverState(
  map: MapLibreMap,
  hoveredPolygonIdRef: MutableRefObject<string | null>,
  onHoverPreview: (preview: MapHoverPreview | null) => void,
): void {
  if (hoveredPolygonIdRef.current) {
    setExcavationFeatureState(map, hoveredPolygonIdRef.current, {
      hover: false,
    })
    hoveredPolygonIdRef.current = null
  }
  map.getCanvas().style.cursor = ''
  onHoverPreview(null)
}

export default function useFindspotMap(
  containerRef: RefObject<HTMLDivElement>,
  provenances: readonly ProvenanceRecord[] | null,
  showBoundaries: boolean,
  activeHistoricalOverlays: readonly ActiveHistoricalMapOverlay[],
  showExcavationAreas: boolean,
  polygonFindspotSummaries: ReadonlyMap<
    string,
    PolygonFindspotSummary
  > = new Map(),
  selection: MapSelection | null = null,
  onSelectFeature: (selection: MapSelection) => void = () => undefined,
  onHoverPreview: (preview: MapHoverPreview | null) => void = () => undefined,
): MutableRefObject<MapLibreMap | null> {
  const mapRef = useRef<MapLibreMap | null>(null)
  const latestProvenancesRef = useRef(provenances)
  const latestShowBoundariesRef = useRef(showBoundaries)
  const latestHistoricalOverlaysRef = useRef(activeHistoricalOverlays)
  const latestShowExcavationAreasRef = useRef(showExcavationAreas)
  const latestPolygonFindspotSummariesRef = useRef(polygonFindspotSummaries)
  const latestOnSelectFeatureRef = useRef(onSelectFeature)
  const latestOnHoverPreviewRef = useRef(onHoverPreview)
  const hoveredPolygonIdRef = useRef<string | null>(null)
  const previousSelectedPolygonIdRef = useRef<string | null>(null)
  const previousSelectedSiteIdRef = useRef<string | null>(null)
  const activeHistoricalOverlayIdsRef = useRef<readonly string[]>([])
  latestProvenancesRef.current = provenances
  latestShowBoundariesRef.current = showBoundaries
  latestHistoricalOverlaysRef.current = activeHistoricalOverlays
  latestShowExcavationAreasRef.current = showExcavationAreas
  latestPolygonFindspotSummariesRef.current = polygonFindspotSummaries
  latestOnSelectFeatureRef.current = onSelectFeature
  latestOnHoverPreviewRef.current = onHoverPreview
  const isReady = provenances !== null

  useEffect(() => {
    if (!containerRef.current || !isReady) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
    })
    mapRef.current = map
    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    map.on('load', () => {
      syncHistoricalOverlays(
        map,
        latestHistoricalOverlaysRef.current,
        activeHistoricalOverlayIdsRef,
      )
      initializeFindspotSources(
        map,
        latestProvenancesRef.current ?? [],
        latestShowBoundariesRef.current,
        latestShowExcavationAreasRef.current,
      )
    })
    map.on('click', (event) =>
      handleMapClick(map, event, latestOnSelectFeatureRef.current),
    )
    map.on('mousemove', (event) =>
      handleMapHover(
        map,
        event,
        hoveredPolygonIdRef,
        latestPolygonFindspotSummariesRef.current,
        latestOnHoverPreviewRef.current,
      ),
    )
    map.on('mouseleave', () =>
      clearHoverState(
        map,
        hoveredPolygonIdRef,
        latestOnHoverPreviewRef.current,
      ),
    )

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [containerRef, isReady])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return

    setBoundaryVisibility(map, showBoundaries)
  }, [showBoundaries])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return

    setExcavationAreaVisibility(map, showExcavationAreas)
  }, [showExcavationAreas])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return

    syncHistoricalOverlays(
      map,
      activeHistoricalOverlays,
      activeHistoricalOverlayIdsRef,
    )
  }, [activeHistoricalOverlays])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return

    for (const [polygonId, summary] of polygonFindspotSummaries) {
      setExcavationFeatureState(map, polygonId, {
        accessibleFragmentCount: summary.accessibleFragmentCount,
        findspotCount: summary.findspotCount,
      })
    }
  }, [polygonFindspotSummaries])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return

    const nextPolygonId = selectedPolygonId(selection)
    if (
      previousSelectedPolygonIdRef.current &&
      previousSelectedPolygonIdRef.current !== nextPolygonId
    ) {
      setExcavationFeatureState(map, previousSelectedPolygonIdRef.current, {
        selected: false,
      })
    }
    if (nextPolygonId) {
      setExcavationFeatureState(map, nextPolygonId, { selected: true })
    }
    previousSelectedPolygonIdRef.current = nextPolygonId

    const nextSiteId = selectedSiteId(selection)
    if (
      previousSelectedSiteIdRef.current &&
      previousSelectedSiteIdRef.current !== nextSiteId
    ) {
      map.setFeatureState(
        { source: SOURCE_ID, id: previousSelectedSiteIdRef.current },
        { selected: false },
      )
    }
    if (nextSiteId) {
      map.setFeatureState(
        { source: SOURCE_ID, id: nextSiteId },
        { selected: true },
      )
    }
    previousSelectedSiteIdRef.current = nextSiteId
  }, [selection])

  return mapRef
}
