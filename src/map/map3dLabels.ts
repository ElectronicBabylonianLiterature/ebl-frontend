import type { MapDimensionMode, MapExtrusionMetric } from './map3dState'

export const EXTRUSION_METRIC_LABELS: Readonly<
  Record<MapExtrusionMetric, string>
> = {
  'accessible-fragments': 'Accessible fragments',
  'mapped-findspots': 'Mapped findspots',
  'log-fragments': 'Accessible fragments (log)',
  'fragment-density': 'Accessible fragments per km²',
}

export const DIMENSION_MODE_LABELS: Readonly<Record<MapDimensionMode, string>> =
  {
    '2d': '2D',
    terrain: 'Modern terrain',
    extrusion: 'Analytical extrusion',
  }

export const ANALYTICAL_3D_TITLE = 'Analytical 3D view'
export function analyticalHeightDisclaimer(metric: MapExtrusionMetric): string {
  return `Polygon height represents ${EXTRUSION_METRIC_LABELS[
    metric
  ].toLowerCase()}. It does not represent building height, stratigraphy, or ancient elevation.`
}

export const EXTRUSION_UNIT_NOTE =
  'Heights are analytical units on a capped scale, not metres.'

export const SCALE_METHOD_LABELS: Readonly<Record<string, string>> = {
  linear: 'Linear scale',
  logarithmic: 'Logarithmic scale',
}

export const TERRAIN_RELIEF_TITLE = 'Modern elevation model'
export const TERRAIN_RELIEF_NOTE =
  'This terrain represents modern elevation and is not a reconstruction of the ancient landscape.'
