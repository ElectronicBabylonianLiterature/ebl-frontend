import type { Map as MapLibreMap } from 'maplibre-gl'
import {
  EXCAVATION_AREA_FILL_LAYER_ID,
  EXCAVATION_AREA_OUTLINE_LAYER_ID,
} from './mapLayerIds'
import {
  type ExcavationPaint,
  excavationPaintProperties,
} from './mapExcavationPaint'
export function applyExcavationPaint(
  map: MapLibreMap,
  paint: ExcavationPaint,
): void {
  const properties = excavationPaintProperties(paint)

  if (map.getLayer(EXCAVATION_AREA_FILL_LAYER_ID)) {
    map.setPaintProperty(
      EXCAVATION_AREA_FILL_LAYER_ID,
      'fill-color',
      properties.fillColor,
    )
    map.setPaintProperty(
      EXCAVATION_AREA_FILL_LAYER_ID,
      'fill-opacity',
      properties.fillOpacity,
    )
  }

  if (map.getLayer(EXCAVATION_AREA_OUTLINE_LAYER_ID)) {
    map.setPaintProperty(
      EXCAVATION_AREA_OUTLINE_LAYER_ID,
      'line-color',
      properties.outlineColor,
    )
    map.setPaintProperty(
      EXCAVATION_AREA_OUTLINE_LAYER_ID,
      'line-width',
      properties.outlineWidth,
    )
    map.setPaintProperty(
      EXCAVATION_AREA_OUTLINE_LAYER_ID,
      'line-dasharray',
      properties.outlineDash,
    )
    map.setPaintProperty(
      EXCAVATION_AREA_OUTLINE_LAYER_ID,
      'line-opacity',
      properties.outlineOpacity,
    )
  }
}
