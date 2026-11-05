import type { AddLayerObject, GeoJSONSourceSpecification } from 'maplibre-gl'
import { EXCAVATION_POLYGON_GEOJSON_URL } from 'map/excavationPolygonIndex'

export const EXCAVATION_AREAS_SOURCE_ID = 'excavation-areas'
export const EXCAVATION_AREA_FILL_LAYER_ID = 'excavation-area-fill'
export const EXCAVATION_AREA_OUTLINE_LAYER_ID = 'excavation-area-outline'

const NEUTRAL_FILL_COLOR = '#6c757d'
const NEUTRAL_OUTLINE_COLOR = '#343a40'

export function createExcavationAreasSource(): GeoJSONSourceSpecification {
  return {
    type: 'geojson',
    data: EXCAVATION_POLYGON_GEOJSON_URL,
    promoteId: 'id',
  }
}

export const excavationAreaFillLayer: AddLayerObject = {
  id: EXCAVATION_AREA_FILL_LAYER_ID,
  type: 'fill',
  source: EXCAVATION_AREAS_SOURCE_ID,
  layout: { visibility: 'visible' },
  paint: {
    'fill-color': NEUTRAL_FILL_COLOR,
    'fill-opacity': 0.15,
  },
}

export const excavationAreaOutlineLayer: AddLayerObject = {
  id: EXCAVATION_AREA_OUTLINE_LAYER_ID,
  type: 'line',
  source: EXCAVATION_AREAS_SOURCE_ID,
  layout: { visibility: 'visible', 'line-join': 'round' },
  paint: {
    'line-color': NEUTRAL_OUTLINE_COLOR,
    'line-width': 1.5,
    'line-opacity': 0.7,
  },
}

export const EXCAVATION_AREA_LAYER_IDS: readonly string[] = [
  EXCAVATION_AREA_FILL_LAYER_ID,
  EXCAVATION_AREA_OUTLINE_LAYER_ID,
]
