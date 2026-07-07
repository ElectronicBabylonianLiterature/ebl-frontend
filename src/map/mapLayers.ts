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

export function createHistoricalRasterLayer(opacity: number): AddLayerObject {
  return {
    id: HISTORICAL_RASTER_LAYER_ID,
    type: 'raster',
    source: HISTORICAL_RASTER_SOURCE_ID,
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
