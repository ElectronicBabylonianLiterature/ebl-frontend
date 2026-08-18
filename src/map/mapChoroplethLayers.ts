import type { Map as MapLibreMap } from 'maplibre-gl'
import {
  EXCAVATION_AREA_FILL_LAYER_ID,
  EXCAVATION_AREA_OUTLINE_LAYER_ID,
} from './mapLayerIds'
import {
  type ExcavationPaint,
  excavationPaintProperties,
} from './mapExcavationPaint'

/**
 * Repaints the excavation layers in place. Sources and layers are reused, so
 * switching visualization mode never recreates map data — and because every
 * mode-dependent property is set here, no stale outline colour or dash can
 * survive a switch between the categorical, evidence and choropleth systems.
 */
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
