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
  createFindspotPopup,
  type FindspotPopupProperties,
} from './createFindspotPopup'
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
  polygonFillLayer,
  polygonOutlineLayer,
  unclusteredLayer,
} from './mapLayers'
import type { FindspotProperties } from './provenanceToGeoJson'
import { provenanceToGeoJson } from './provenanceToGeoJson'
import { provenancesToPolygonGeoJson } from './provenanceToPolygonGeoJson'

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

function createExcavationAreaPopup(
  feature: MapGeoJSONFeature,
  browseHistoricalMapsForSite?: (siteName: string) => void,
): HTMLElement | null {
  const properties = feature.properties
  const siteName = properties?.siteName
  const name = properties?.name
  const sourceId = properties?.sourceId

  if (typeof siteName !== 'string' || typeof name !== 'string') {
    return null
  }

  const container = document.createElement('div')
  container.className = 'findspot-popup'

  const title = document.createElement('strong')
  title.textContent = name
  container.append(title)

  const site = document.createElement('span')
  site.textContent = siteName
  container.append(site)

  const type = document.createElement('span')
  type.textContent = 'Excavation area'
  container.append(type)

  if (typeof sourceId === 'number' || typeof sourceId === 'string') {
    const source = document.createElement('span')
    source.textContent = `Source ID: ${sourceId}`
    container.append(source)
  }

  if (browseHistoricalMapsForSite) {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'btn btn-outline-secondary btn-sm'
    button.textContent = `Browse historical maps for ${siteName}`
    button.addEventListener('click', () =>
      browseHistoricalMapsForSite(siteName),
    )
    container.append(button)
  }

  return container
}

function openExcavationAreaPopup(
  map: MapLibreMap,
  feature: MapGeoJSONFeature,
  coordinates: [number, number],
  browseHistoricalMapsForSite?: (siteName: string) => void,
): void {
  const content = createExcavationAreaPopup(
    feature,
    browseHistoricalMapsForSite,
  )
  if (!content) return

  new maplibregl.Popup()
    .setLngLat(coordinates)
    .setDOMContent(content)
    .addTo(map)
}

function setExcavationAreaVisibility(
  map: MapLibreMap,
  isVisible: boolean,
): void {
  const visibility = isVisible ? 'visible' : 'none'

  for (const layerId of [
    EXCAVATION_AREA_FILL_LAYER_ID,
    EXCAVATION_AREA_OUTLINE_LAYER_ID,
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

function isGeometryType(
  value: unknown,
): value is FindspotProperties['geometryType'] {
  return value === 'point' || value === 'polygon'
}

function getFeaturePointCoordinates(
  feature: MapGeoJSONFeature,
): [number, number] | null {
  if (feature.geometry.type !== 'Point') return null

  const coordinates = (feature.geometry as Point).coordinates
  const longitude = coordinates[0]
  const latitude = coordinates[1]

  if (typeof longitude !== 'number' || !Number.isFinite(longitude)) {
    return null
  }

  if (typeof latitude !== 'number' || !Number.isFinite(latitude)) {
    return null
  }

  return [longitude, latitude]
}

function getPopupProperties(
  feature: MapGeoJSONFeature,
): FindspotPopupProperties | null {
  const name = feature.properties?.name
  const abbreviation = feature.properties?.abbreviation
  const parent = feature.properties?.parent
  const geometryType = feature.properties?.geometryType
  const pointCoordinates = getFeaturePointCoordinates(feature)

  if (typeof name !== 'string' || typeof abbreviation !== 'string') {
    return null
  }

  if (parent !== undefined && parent !== null && typeof parent !== 'string') {
    return null
  }

  if (!isGeometryType(geometryType)) {
    return null
  }

  return {
    name,
    abbreviation,
    parent: typeof parent === 'string' ? parent : undefined,
    geometryType,
    coordinates: pointCoordinates
      ? { latitude: pointCoordinates[1], longitude: pointCoordinates[0] }
      : undefined,
  }
}

function openFindspotPopup(
  map: MapLibreMap,
  popupProperties: FindspotPopupProperties,
  coordinates: [number, number],
): void {
  new maplibregl.Popup()
    .setLngLat(coordinates)
    .setDOMContent(createFindspotPopup(popupProperties))
    .addTo(map)
}

function handleMapClick(
  map: MapLibreMap,
  event: MapMouseEvent,
  browseHistoricalMapsForSite?: (siteName: string) => void,
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
    const popupProperties = getPopupProperties(findspot)
    const coordinates = getFeaturePointCoordinates(findspot)

    if (popupProperties && coordinates) {
      openFindspotPopup(map, popupProperties, coordinates)
    }
    return
  }

  const [excavationArea] = map.queryRenderedFeatures(event.point, {
    layers: [excavationAreaFillLayer.id],
  })
  if (excavationArea) {
    openExcavationAreaPopup(
      map,
      excavationArea,
      [event.lngLat.lng, event.lngLat.lat],
      browseHistoricalMapsForSite,
    )
    return
  }

  const [polygon] = map.queryRenderedFeatures(event.point, {
    layers: [polygonFillLayer.id],
  })
  if (polygon) {
    const popupProperties = getPopupProperties(polygon)
    if (popupProperties) {
      openFindspotPopup(map, popupProperties, [
        event.lngLat.lng,
        event.lngLat.lat,
      ])
    }
  }
}

function setPointerCursor(map: MapLibreMap, event: MapMouseEvent): void {
  const isOverInteractiveLayer =
    map.queryRenderedFeatures(event.point, {
      layers: INTERACTIVE_LAYER_IDS,
    }).length > 0
  map.getCanvas().style.cursor = isOverInteractiveLayer ? 'pointer' : ''
}

export default function useFindspotMap(
  containerRef: RefObject<HTMLDivElement>,
  provenances: readonly ProvenanceRecord[] | null,
  showBoundaries: boolean,
  activeHistoricalOverlays: readonly ActiveHistoricalMapOverlay[],
  showExcavationAreas: boolean,
  browseHistoricalMapsForSite?: (siteName: string) => void,
): MutableRefObject<MapLibreMap | null> {
  const mapRef = useRef<MapLibreMap | null>(null)
  const latestProvenancesRef = useRef(provenances)
  const latestShowBoundariesRef = useRef(showBoundaries)
  const latestHistoricalOverlaysRef = useRef(activeHistoricalOverlays)
  const latestShowExcavationAreasRef = useRef(showExcavationAreas)
  const latestBrowseHistoricalMapsForSiteRef = useRef(
    browseHistoricalMapsForSite,
  )
  const activeHistoricalOverlayIdsRef = useRef<readonly string[]>([])
  latestProvenancesRef.current = provenances
  latestShowBoundariesRef.current = showBoundaries
  latestHistoricalOverlaysRef.current = activeHistoricalOverlays
  latestShowExcavationAreasRef.current = showExcavationAreas
  latestBrowseHistoricalMapsForSiteRef.current = browseHistoricalMapsForSite
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
      handleMapClick(map, event, latestBrowseHistoricalMapsForSiteRef.current),
    )
    map.on('mousemove', (event) => setPointerCursor(map, event))

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

  return mapRef
}
