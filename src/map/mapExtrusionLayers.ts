import type { AddLayerObject, Map as MapLibreMap } from 'maplibre-gl'
import {
  EXCAVATION_AREA_SELECTED_LAYER_ID,
  EXCAVATION_AREAS_SOURCE_ID,
  EXCAVATION_EXTRUSION_LAYER_ID,
} from './mapLayerIds'
import {
  type ExcavationPaint,
  excavationPaintProperties,
} from './mapExcavationPaint'
import {
  type ExtrusionScale,
  extrusionHeightExpression,
} from './mapExtrusionScale'

export { EXCAVATION_EXTRUSION_LAYER_ID }

export const EXTRUSION_OPACITY = 0.85

/**
 * The extrusion reuses the canonical excavation-polygon source — there is no
 * second copy of the geometry, and switching metric only repaints. Colour comes
 * from the active 2D analytical or evidence palette, so height and colour never
 * tell two different stories.
 */
export function createExcavationExtrusionLayer(
  paint: ExcavationPaint,
  scale: ExtrusionScale | null,
  isVisible = false,
): AddLayerObject {
  return {
    id: EXCAVATION_EXTRUSION_LAYER_ID,
    type: 'fill-extrusion',
    source: EXCAVATION_AREAS_SOURCE_ID,
    layout: { visibility: isVisible ? 'visible' : 'none' },
    paint: {
      'fill-extrusion-color': excavationPaintProperties(paint).fillColor,
      'fill-extrusion-height': extrusionHeightExpression(scale),
      'fill-extrusion-base': 0,
      'fill-extrusion-opacity': EXTRUSION_OPACITY,
      'fill-extrusion-vertical-gradient': true,
    },
  }
}

export function applyExtrusionPaint(
  map: MapLibreMap,
  paint: ExcavationPaint,
  scale: ExtrusionScale | null,
): void {
  if (!map.getLayer(EXCAVATION_EXTRUSION_LAYER_ID)) return

  map.setPaintProperty(
    EXCAVATION_EXTRUSION_LAYER_ID,
    'fill-extrusion-color',
    excavationPaintProperties(paint).fillColor,
  )
  map.setPaintProperty(
    EXCAVATION_EXTRUSION_LAYER_ID,
    'fill-extrusion-height',
    extrusionHeightExpression(scale),
  )
}

export function setExtrusionVisibility(
  map: MapLibreMap,
  isVisible: boolean,
): void {
  if (!map.getLayer(EXCAVATION_EXTRUSION_LAYER_ID)) return

  map.setLayoutProperty(
    EXCAVATION_EXTRUSION_LAYER_ID,
    'visibility',
    isVisible ? 'visible' : 'none',
  )
}

export const EXTRUSION_PITCH = 52
export const FLAT_PITCH_THRESHOLD = 10

export interface PitchableMap {
  getPitch: () => number
  easeTo: (options: { pitch: number; duration?: number }) => void
}

/**
 * Only lifts a view that is still essentially flat. A reader who has already
 * pitched or oriented the camera keeps it, and centre and selection are never
 * touched here.
 */
export function pitchForExtrusion(
  map: PitchableMap,
  isReducedMotion: boolean,
): void {
  if (map.getPitch() > FLAT_PITCH_THRESHOLD) return

  map.easeTo({ pitch: EXTRUSION_PITCH, duration: isReducedMotion ? 0 : 600 })
}

/** The halo line sits above the extrusion so a selected polygon stays legible. */
export const EXTRUSION_BEFORE_LAYER_ID = EXCAVATION_AREA_SELECTED_LAYER_ID
