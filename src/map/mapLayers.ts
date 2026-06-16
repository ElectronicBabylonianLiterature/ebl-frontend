import type { AddLayerObject, GeoJSONSourceSpecification } from 'maplibre-gl'

export const SOURCE_ID = 'ebl-findspots'
export const CLUSTER_RADIUS = 50
export const CLUSTER_MAX_ZOOM = 14

export function createFindspotsSource(
  data: GeoJSON.FeatureCollection,
): GeoJSONSourceSpecification {
  return {
    type: 'geojson',
    data,
    cluster: true,
    clusterRadius: CLUSTER_RADIUS,
    clusterMaxZoom: CLUSTER_MAX_ZOOM,
  }
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
