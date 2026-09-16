import type { AddLayerObject, GeoJSONSourceSpecification } from 'maplibre-gl'
import { EXCAVATION_POLYGON_GEOJSON_URL } from './excavationPolygonIndex'
import {
  EXCAVATION_AREA_FILL_LAYER_ID,
  EXCAVATION_AREA_OUTLINE_LAYER_ID,
  EXCAVATION_AREA_SELECTED_LAYER_ID,
  EXCAVATION_AREAS_SOURCE_ID,
} from './mapLayerIds'
import {
  CATEGORICAL_PAINT,
  type ExcavationPaint,
  excavationPaintProperties,
} from './mapExcavationPaint'
import { SELECTED } from './mapStateExpressions'

export function createExcavationAreasSource(): GeoJSONSourceSpecification {
  return {
    type: 'geojson',
    data: EXCAVATION_POLYGON_GEOJSON_URL,
    promoteId: 'id',
  }
}

export function createExcavationAreaFillLayer(
  paint: ExcavationPaint = CATEGORICAL_PAINT,
): AddLayerObject {
  const properties = excavationPaintProperties(paint)

  return {
    id: EXCAVATION_AREA_FILL_LAYER_ID,
    type: 'fill',
    source: EXCAVATION_AREAS_SOURCE_ID,
    layout: { visibility: 'visible' },
    paint: {
      'fill-color': properties.fillColor,
      'fill-opacity': properties.fillOpacity,
    },
  }
}

export function createExcavationAreaOutlineLayer(
  paint: ExcavationPaint = CATEGORICAL_PAINT,
): AddLayerObject {
  const properties = excavationPaintProperties(paint)

  return {
    id: EXCAVATION_AREA_OUTLINE_LAYER_ID,
    type: 'line',
    source: EXCAVATION_AREAS_SOURCE_ID,
    layout: { visibility: 'visible', 'line-join': 'round' },
    paint: {
      'line-color': properties.outlineColor,
      'line-width': properties.outlineWidth,
      'line-opacity': properties.outlineOpacity,
      'line-dasharray': properties.outlineDash,
    },
  }
}

/**
 * A white halo drawn beneath the outline. It is what keeps a selected polygon
 * unmistakable over a dark historical raster or hillshaded terrain, where a
 * single dark border would otherwise disappear.
 */
export const excavationAreaSelectedLayer: AddLayerObject = {
  id: EXCAVATION_AREA_SELECTED_LAYER_ID,
  type: 'line',
  source: EXCAVATION_AREAS_SOURCE_ID,
  layout: { visibility: 'visible', 'line-join': 'round' },
  paint: {
    'line-color': '#ffffff',
    'line-width': ['case', SELECTED, 7, 0],
    'line-opacity': ['case', SELECTED, 0.9, 0],
    'line-blur': ['case', SELECTED, 1.5, 0],
  },
}

export const excavationAreaFillLayer = createExcavationAreaFillLayer()
export const excavationAreaOutlineLayer = createExcavationAreaOutlineLayer()
