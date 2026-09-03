export const SOURCE_ID = 'ebl-findspots'
export const POLYGON_SOURCE_ID = 'ebl-findspot-polygons'
export const HISTORICAL_RASTER_SOURCE_ID = 'ebl-historical-raster'
export const HISTORICAL_RASTER_LAYER_ID = 'ebl-historical-raster-layer'
export const EXCAVATION_AREAS_SOURCE_ID = 'ebl-excavation-areas'

export const POLYGON_FILL_LAYER_ID = 'ebl-findspot-polygon-fill'
export const POLYGON_OUTLINE_LAYER_ID = 'ebl-findspot-polygon-outline'
export const EXCAVATION_AREA_FILL_LAYER_ID = 'ebl-excavation-area-fill'
export const EXCAVATION_AREA_OUTLINE_LAYER_ID = 'ebl-excavation-area-outline'
export const EXCAVATION_AREA_SELECTED_LAYER_ID = 'ebl-excavation-area-selected'
export const EXCAVATION_EXTRUSION_LAYER_ID = 'ebl-excavation-extrusion'
export const CLUSTER_LAYER_ID = 'ebl-clusters'
export const CLUSTER_COUNT_LAYER_ID = 'ebl-cluster-count'
export const UNCLUSTERED_LAYER_ID = 'ebl-unclustered-points'

export const CLUSTER_RADIUS = 50
export const CLUSTER_MAX_ZOOM = 14

export function historicalRasterSourceId(overlayId: string): string {
  return `${HISTORICAL_RASTER_SOURCE_ID}-${overlayId}`
}

export function historicalRasterLayerId(overlayId: string): string {
  return `${HISTORICAL_RASTER_LAYER_ID}-${overlayId}`
}
