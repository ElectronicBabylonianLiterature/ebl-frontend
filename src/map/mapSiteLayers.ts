import type { FeatureCollection } from 'geojson'
import type {
  AddLayerObject,
  ExpressionSpecification,
  GeoJSONSourceSpecification,
} from 'maplibre-gl'
import {
  CLUSTER_COUNT_LAYER_ID,
  CLUSTER_LAYER_ID,
  CLUSTER_MAX_ZOOM,
  CLUSTER_RADIUS,
  POLYGON_FILL_LAYER_ID,
  POLYGON_OUTLINE_LAYER_ID,
  POLYGON_SOURCE_ID,
  SOURCE_ID,
  UNCLUSTERED_LAYER_ID,
} from './mapLayerIds'
import { SELECTED, stateNumber } from './mapStateExpressions'
import { SITE_MARKER_CODES } from './mapSiteSummaries'

/** Ink, parchment and clay — the atlas palette the polygons already use. */
export const SITE_COLOR_COORDINATES = '#5b6b7a'
export const SITE_COLOR_EXCAVATION = '#2f6f8f'
export const SITE_COLOR_FRAGMENT_DATA = '#b36b24'
export const SITE_COLOR_SELECTED = '#8a3d10'
export const CLUSTER_COLOR = '#26465f'
export const CLUSTER_RING_COLOR = '#f7f3ea'

const SITE_CODE = stateNumber('siteCode')

const SITE_COLOR = [
  'step',
  SITE_CODE,
  SITE_COLOR_COORDINATES,
  SITE_MARKER_CODES.excavationPolygons,
  SITE_COLOR_EXCAVATION,
  SITE_MARKER_CODES.fragmentMapData,
  SITE_COLOR_FRAGMENT_DATA,
] as unknown as ExpressionSpecification

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
  return { type: 'geojson', data }
}

export const polygonFillLayer: AddLayerObject = {
  id: POLYGON_FILL_LAYER_ID,
  type: 'fill',
  source: POLYGON_SOURCE_ID,
  layout: { visibility: 'visible' },
  paint: {
    'fill-color': '#4b6b86',
    'fill-opacity': 0.12,
  },
}

export const polygonOutlineLayer: AddLayerObject = {
  id: POLYGON_OUTLINE_LAYER_ID,
  type: 'line',
  source: POLYGON_SOURCE_ID,
  layout: { visibility: 'visible', 'line-join': 'round' },
  paint: {
    'line-color': '#33556e',
    'line-width': 1.6,
    'line-opacity': 0.7,
    'line-dasharray': [3, 2],
  },
}

/**
 * A layered disc: a soft parchment ring around a deep-ink core, so a cluster
 * stays readable over hillshaded terrain and over a scanned historical sheet
 * alike. The radius grows gently — a ten-fold count change is roughly a
 * two-fold radius change, not a blob that swallows the map.
 */
export const clusterLayer: AddLayerObject = {
  id: CLUSTER_LAYER_ID,
  type: 'circle',
  source: SOURCE_ID,
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': CLUSTER_COLOR,
    'circle-radius': [
      'step',
      ['get', 'point_count'],
      16,
      5,
      20,
      15,
      24,
      40,
      29,
    ],
    'circle-stroke-width': ['step', ['get', 'point_count'], 3, 15, 4],
    'circle-stroke-color': CLUSTER_RING_COLOR,
    'circle-stroke-opacity': 0.92,
    'circle-opacity': 0.94,
  },
}

export const clusterCountLayer: AddLayerObject = {
  id: CLUSTER_COUNT_LAYER_ID,
  type: 'symbol',
  source: SOURCE_ID,
  filter: ['has', 'point_count'],
  layout: {
    'text-field': '{point_count_abbreviated}',
    'text-size': ['step', ['get', 'point_count'], 12, 15, 13, 40, 14],
    'text-allow-overlap': true,
  },
  paint: {
    'text-color': CLUSTER_RING_COLOR,
    'text-halo-color': CLUSTER_COLOR,
    'text-halo-width': 1.2,
  },
}

/**
 * Selection adds a ring rather than changing the marker's identity: the fill
 * still says what evidence the site has, and the halo says it is selected.
 * A site carrying historical overlays gets a slightly heavier collar, so the
 * state is legible without a second colour axis.
 */
export const unclusteredLayer: AddLayerObject = {
  id: UNCLUSTERED_LAYER_ID,
  type: 'circle',
  source: SOURCE_ID,
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': ['case', SELECTED, SITE_COLOR_SELECTED, SITE_COLOR],
    'circle-radius': [
      'case',
      SELECTED,
      11,
      ['>', SITE_CODE, SITE_MARKER_CODES.coordinates],
      8,
      6.5,
    ],
    'circle-stroke-width': [
      'case',
      SELECTED,
      5,
      ['>', stateNumber('historicalMapCount'), 0],
      3,
      2,
    ],
    'circle-stroke-color': '#ffffff',
    'circle-stroke-opacity': ['case', SELECTED, 0.95, 0.85],
  },
}
