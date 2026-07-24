import type { FeatureCollection } from 'geojson'
import type {
  AddLayerObject,
  GeoJSONSourceSpecification,
  RasterSourceSpecification,
} from 'maplibre-gl'
import type { HistoricalMapOverlay } from './historicalOverlays'

export const SOURCE_ID = 'ebl-findspots'
export const POLYGON_SOURCE_ID = 'ebl-findspot-polygons'
export const HISTORICAL_RASTER_SOURCE_ID = 'ebl-historical-raster'
export const HISTORICAL_RASTER_LAYER_ID = 'ebl-historical-raster-layer'
export const EXCAVATION_AREAS_SOURCE_ID = 'ebl-excavation-areas'
export const EXCAVATION_AREA_FILL_LAYER_ID = 'ebl-excavation-area-fill'
export const EXCAVATION_AREA_OUTLINE_LAYER_ID = 'ebl-excavation-area-outline'
export const CLUSTER_RADIUS = 50
export const CLUSTER_MAX_ZOOM = 14

export function createFindspotsSource(
  data: FeatureCollection,
): GeoJSONSourceSpecification {
  return {
    type: 'geojson',
    data,
    cluster: true,
    clusterRadius: CLUSTER_RADIUS,
    clusterMaxZoom: CLUSTER_MAX_ZOOM,
  }
}

export function createFindspotPolygonsSource(
  data: FeatureCollection,
): GeoJSONSourceSpecification {
  return {
    type: 'geojson',
    data,
  }
}

export function historicalRasterSourceId(overlayId: string): string {
  return `${HISTORICAL_RASTER_SOURCE_ID}-${overlayId}`
}

export function historicalRasterLayerId(overlayId: string): string {
  return `${HISTORICAL_RASTER_LAYER_ID}-${overlayId}`
}

export function createHistoricalRasterSource(
  overlay: HistoricalMapOverlay,
): RasterSourceSpecification {
  return {
    type: 'raster',
    tiles: [...overlay.tiles],
    attribution: overlay.attribution,
    ...(overlay.bounds
      ? { bounds: [...overlay.bounds] as [number, number, number, number] }
      : {}),
    ...(overlay.minZoom !== undefined ? { minzoom: overlay.minZoom } : {}),
    ...(overlay.maxZoom !== undefined ? { maxzoom: overlay.maxZoom } : {}),
    ...(overlay.tileSize !== undefined ? { tileSize: overlay.tileSize } : {}),
  }
}

export function createHistoricalRasterLayer(
  overlay: HistoricalMapOverlay,
  opacity: number,
): AddLayerObject {
  return {
    id: historicalRasterLayerId(overlay.id),
    type: 'raster',
    source: historicalRasterSourceId(overlay.id),
    paint: {
      'raster-opacity': opacity,
    },
  }
}

export const polygonFillLayer: AddLayerObject = {
  id: 'ebl-findspot-polygon-fill',
  type: 'fill',
  source: POLYGON_SOURCE_ID,
  layout: {
    visibility: 'visible',
  },
  paint: {
    'fill-color': '#0077be',
    'fill-opacity': 0.18,
  },
}

export const polygonOutlineLayer: AddLayerObject = {
  id: 'ebl-findspot-polygon-outline',
  type: 'line',
  source: POLYGON_SOURCE_ID,
  layout: {
    visibility: 'visible',
  },
  paint: {
    'line-color': '#005b8f',
    'line-width': 2,
    'line-opacity': 0.8,
  },
}

export function createExcavationAreasSource(): GeoJSONSourceSpecification {
  return {
    type: 'geojson',
    data: '/map-data/findspots/all.geojson',
  }
}

export const excavationAreaFillLayer: AddLayerObject = {
  id: EXCAVATION_AREA_FILL_LAYER_ID,
  type: 'fill',
  source: EXCAVATION_AREAS_SOURCE_ID,
  layout: {
    visibility: 'visible',
  },
  paint: {
    'fill-color': '#7a8f2a',
    'fill-opacity': 0.16,
  },
}

export const excavationAreaOutlineLayer: AddLayerObject = {
  id: EXCAVATION_AREA_OUTLINE_LAYER_ID,
  type: 'line',
  source: EXCAVATION_AREAS_SOURCE_ID,
  layout: {
    visibility: 'visible',
  },
  paint: {
    'line-color': '#5f711f',
    'line-width': 1.5,
    'line-opacity': 0.75,
  },
}

export const clusterLayer: AddLayerObject = {
  id: 'ebl-clusters',
  type: 'circle',
  source: SOURCE_ID,
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': [
      'step',
      ['get', 'point_count'],
      '#51bbd6',
      10,
      '#f1f075',
      30,
      '#f28cb1',
    ],
    'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 30, 40],
    'circle-stroke-width': 2,
    'circle-stroke-color': '#ffffff',
  },
}

export const clusterCountLayer: AddLayerObject = {
  id: 'ebl-cluster-count',
  type: 'symbol',
  source: SOURCE_ID,
  filter: ['has', 'point_count'],
  layout: {
    'text-field': '{point_count_abbreviated}',
    'text-size': 12,
  },
}

export const unclusteredLayer: AddLayerObject = {
  id: 'ebl-unclustered-points',
  type: 'circle',
  source: SOURCE_ID,
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': '#0077be',
    'circle-radius': 8,
    'circle-stroke-width': 2,
    'circle-stroke-color': '#ffffff',
  },
}
