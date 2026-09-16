const CLUSTER_ID_PROPERTY = 'cluster_id'

export function pointFeature(id: string, name: string): unknown {
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [43.25, 35.45] },
    properties: { id, name },
  }
}

export function clusterFeature(clusterId: unknown): unknown {
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [43.25, 35.45] },
    properties: { [CLUSTER_ID_PROPERTY]: clusterId },
  }
}
