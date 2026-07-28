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
export const EXCAVATION_AREA_SELECTED_LAYER_ID = 'ebl-excavation-area-selected'
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
    promoteId: 'id',
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
    'fill-color': [
      'case',
      ['boolean', ['feature-state', 'selected'], false],
      '#b35c1e',
      ['>', ['coalesce', ['feature-state', 'accessibleFragmentCount'], 0], 0],
      '#b36b24',
      ['>', ['coalesce', ['feature-state', 'findspotCount'], 0], 0],
      '#4f8f9f',
      '#7b7f73',
    ],
    'fill-opacity': [
      'case',
      ['boolean', ['feature-state', 'selected'], false],
      0.36,
      ['boolean', ['feature-state', 'hover'], false],
      0.3,
      ['>', ['coalesce', ['feature-state', 'accessibleFragmentCount'], 0], 0],
      [
        'interpolate',
        ['linear'],
        ['coalesce', ['feature-state', 'accessibleFragmentCount'], 0],
        1,
        0.18,
        25,
        0.34,
      ],
      ['>', ['coalesce', ['feature-state', 'findspotCount'], 0], 0],
      0.16,
      0.08,
    ],
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
    'line-color': [
      'case',
      ['boolean', ['feature-state', 'selected'], false],
      '#6f2f10',
      ['>', ['coalesce', ['feature-state', 'findspotCount'], 0], 0],
      '#7f4f20',
      '#5f665c',
    ],
    'line-width': [
      'case',
      ['boolean', ['feature-state', 'selected'], false],
      3.5,
      ['boolean', ['feature-state', 'hover'], false],
      2.4,
      1.2,
    ],
    'line-opacity': [
      'case',
      ['boolean', ['feature-state', 'selected'], false],
      0.95,
      ['>', ['coalesce', ['feature-state', 'findspotCount'], 0], 0],
      0.8,
      0.45,
    ],
    'line-dasharray': [
      'case',
      ['>', ['coalesce', ['feature-state', 'findspotCount'], 0], 0],
      ['literal', [1, 0]],
      ['literal', [2, 1.5]],
    ],
  },
}

export const excavationAreaSelectedLayer: AddLayerObject = {
  id: EXCAVATION_AREA_SELECTED_LAYER_ID,
  type: 'line',
  source: EXCAVATION_AREAS_SOURCE_ID,
  layout: {
    visibility: 'visible',
  },
  paint: {
    'line-color': '#ffffff',
    'line-width': [
      'case',
      ['boolean', ['feature-state', 'selected'], false],
      6,
      0,
    ],
    'line-opacity': [
      'case',
      ['boolean', ['feature-state', 'selected'], false],
      0.85,
      0,
    ],
  },
}

export const clusterLayer: AddLayerObject = {
  id: 'ebl-clusters',
  type: 'circle',
  source: SOURCE_ID,
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': '#26465f',
    'circle-radius': ['step', ['get', 'point_count'], 18, 10, 24, 30, 32],
    'circle-stroke-width': 3,
    'circle-stroke-color': '#f7f3ea',
    'circle-opacity': 0.92,
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
    'circle-color': [
      'case',
      ['boolean', ['feature-state', 'selected'], false],
      '#b35c1e',
      '#0077be',
    ],
    'circle-radius': [
      'case',
      ['boolean', ['feature-state', 'selected'], false],
      10,
      7,
    ],
    'circle-stroke-width': [
      'case',
      ['boolean', ['feature-state', 'selected'], false],
      4,
      2,
    ],
    'circle-stroke-color': '#ffffff',
  },
}
