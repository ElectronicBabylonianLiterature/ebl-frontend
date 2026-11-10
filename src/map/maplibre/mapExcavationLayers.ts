import type { AddLayerObject, GeoJSONSourceSpecification } from 'maplibre-gl'
import type { ExcavationPolygonIndex } from 'map/domain/excavationPolygonIndex'
import {
  EXCAVATION_AREA_FILL_LAYER_ID,
  EXCAVATION_AREA_OUTLINE_LAYER_ID,
  EXCAVATION_AREA_SELECTED_LAYER_ID,
  EXCAVATION_AREAS_SOURCE_ID,
} from 'map/domain/mapLayerIds'
import {
  CATEGORICAL_PAINT,
  type ExcavationPaint,
  excavationPaintProperties,
} from 'map/maplibre/mapExcavationPaint'
import { SELECTED } from 'map/domain/mapStateExpressions'
export {
  EXCAVATION_AREA_FILL_LAYER_ID,
  EXCAVATION_AREA_OUTLINE_LAYER_ID,
  EXCAVATION_AREA_SELECTED_LAYER_ID,
  EXCAVATION_AREAS_SOURCE_ID,
} from 'map/domain/mapLayerIds'

export function createExcavationAreasSource(
  index: ExcavationPolygonIndex,
): GeoJSONSourceSpecification {
  return {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [...index.values()].flatMap((polygons) =>
        polygons.map((polygon) => ({
          type: 'Feature',
          id: polygon.polygonId,
          properties: {
            id: polygon.polygonId,
            siteId: polygon.siteId,
            name: polygon.name,
          },
          geometry: polygon.geometry,
        })),
      ),
    },
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
export const EXCAVATION_AREA_LAYER_IDS: readonly string[] = [
  EXCAVATION_AREA_FILL_LAYER_ID,
  EXCAVATION_AREA_OUTLINE_LAYER_ID,
]
