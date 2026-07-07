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
  HISTORICAL_RASTER_LAYER_ID,
  HISTORICAL_RASTER_SOURCE_ID,
  POLYGON_SOURCE_ID,
  SOURCE_ID,
  clusterCountLayer,
  clusterLayer,
  createHistoricalRasterLayer,
  createHistoricalRasterSource,
  createFindspotPolygonsSource,
  createFindspotsSource,
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

function removeHistoricalOverlay(map: MapLibreMap): void {
  if (map.getLayer(HISTORICAL_RASTER_LAYER_ID)) {
    map.removeLayer(HISTORICAL_RASTER_LAYER_ID)
  }

  if (map.getSource(HISTORICAL_RASTER_SOURCE_ID)) {
    map.removeSource(HISTORICAL_RASTER_SOURCE_ID)
  }
}

function addHistoricalOverlay(
  map: MapLibreMap,
  overlay: HistoricalMapOverlay,
  opacity: number,
): void {
  if (!map.getSource(HISTORICAL_RASTER_SOURCE_ID)) {
    map.addSource(
      HISTORICAL_RASTER_SOURCE_ID,
      createHistoricalRasterSource(overlay),
    )
  }

  if (!map.getLayer(HISTORICAL_RASTER_LAYER_ID)) {
    const layer = createHistoricalRasterLayer(clampRasterOpacity(opacity))
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

function syncHistoricalOverlay(
  map: MapLibreMap,
  overlay: HistoricalMapOverlay | null,
  opacity: number,
  activeOverlayIdRef: MutableRefObject<string | null>,
): void {
  if (!overlay) {
    removeHistoricalOverlay(map)
    activeOverlayIdRef.current = null
    return
  }

  if (activeOverlayIdRef.current !== overlay.id) {
    removeHistoricalOverlay(map)
    addHistoricalOverlay(map, overlay, opacity)
    activeOverlayIdRef.current = overlay.id
    return
  }

  if (
    !map.getSource(HISTORICAL_RASTER_SOURCE_ID) ||
    !map.getLayer(HISTORICAL_RASTER_LAYER_ID)
  ) {
    addHistoricalOverlay(map, overlay, opacity)
  }

  if (map.getLayer(HISTORICAL_RASTER_LAYER_ID)) {
    map.setPaintProperty(
      HISTORICAL_RASTER_LAYER_ID,
      'raster-opacity',
      clampRasterOpacity(opacity),
    )
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
): void {
  const pointGeoJson = provenanceToGeoJson(provenances)
  const polygonGeoJson = provenancesToPolygonGeoJson(provenances)

  map.addSource(POLYGON_SOURCE_ID, createFindspotPolygonsSource(polygonGeoJson))
  map.addLayer(polygonFillLayer)
  map.addLayer(polygonOutlineLayer)
  setBoundaryVisibility(map, showBoundaries)

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

function handleMapClick(map: MapLibreMap, event: MapMouseEvent): void {
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
  historicalOverlay: HistoricalMapOverlay | null,
  historicalOverlayOpacity: number,
): MutableRefObject<MapLibreMap | null> {
  const mapRef = useRef<MapLibreMap | null>(null)
  const latestProvenancesRef = useRef(provenances)
  const latestShowBoundariesRef = useRef(showBoundaries)
  const latestHistoricalOverlayRef = useRef(historicalOverlay)
  const latestHistoricalOverlayOpacityRef = useRef(historicalOverlayOpacity)
  const activeHistoricalOverlayIdRef = useRef<string | null>(null)
  latestProvenancesRef.current = provenances
  latestShowBoundariesRef.current = showBoundaries
  latestHistoricalOverlayRef.current = historicalOverlay
  latestHistoricalOverlayOpacityRef.current = historicalOverlayOpacity
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
      syncHistoricalOverlay(
        map,
        latestHistoricalOverlayRef.current,
        latestHistoricalOverlayOpacityRef.current,
        activeHistoricalOverlayIdRef,
      )
      initializeFindspotSources(
        map,
        latestProvenancesRef.current ?? [],
        latestShowBoundariesRef.current,
      )
    })
    map.on('click', (event) => handleMapClick(map, event))
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

    syncHistoricalOverlay(
      map,
      historicalOverlay,
      historicalOverlayOpacity,
      activeHistoricalOverlayIdRef,
    )
  }, [historicalOverlay, historicalOverlayOpacity])

  return mapRef
}
