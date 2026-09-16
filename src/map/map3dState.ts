import {
  DEFAULT_TERRAIN_EXAGGERATION,
  MAX_TERRAIN_EXAGGERATION,
} from './mapTerrainLayers'

/**
 * The view a researcher has chosen. `terrain` and `extrusion` are not two
 * independent booleans here: the mode is *derived* from the existing terrain
 * tool flag plus this module's extrusion flag, so terrain keeps exactly one
 * source of truth (`MapToolUrlState.terrain`, URL key `t`).
 */
export type MapDimensionMode = '2d' | 'terrain' | 'extrusion'

export type MapExtrusionMetric =
  | 'accessible-fragments'
  | 'mapped-findspots'
  | 'log-fragments'
  | 'fragment-density'

export const MAP_EXTRUSION_METRICS: readonly MapExtrusionMetric[] = [
  'accessible-fragments',
  'mapped-findspots',
  'log-fragments',
  'fragment-density',
]

export const MIN_EXTRUSION_SCALE = 0.5
export const MAX_EXTRUSION_SCALE = 2
export const MIN_TERRAIN_EXAGGERATION = 0.5

export interface Map3dState {
  readonly isExtrusionEnabled: boolean
  readonly extrusionMetric: MapExtrusionMetric
  readonly extrusionScale: number
  readonly terrainExaggeration: number
  readonly hillshadeVisible: boolean
}

export const DEFAULT_MAP_3D_STATE: Map3dState = {
  isExtrusionEnabled: false,
  extrusionMetric: 'accessible-fragments',
  extrusionScale: 1,
  terrainExaggeration: DEFAULT_TERRAIN_EXAGGERATION,
  hillshadeVisible: true,
}

export function isMapExtrusionMetric(
  value: unknown,
): value is MapExtrusionMetric {
  return MAP_EXTRUSION_METRICS.includes(value as MapExtrusionMetric)
}

export function clampExtrusionScale(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_MAP_3D_STATE.extrusionScale
  return Math.min(Math.max(value, MIN_EXTRUSION_SCALE), MAX_EXTRUSION_SCALE)
}

/**
 * A restrained range. Terrain is a modern elevation model shown for legibility,
 * not a dramatised landscape, so the ceiling stays well below theme-park
 * exaggeration.
 */
export function clampTerrainExaggeration(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_MAP_3D_STATE.terrainExaggeration
  return Math.min(
    Math.max(value, MIN_TERRAIN_EXAGGERATION),
    MAX_TERRAIN_EXAGGERATION,
  )
}

export function dimensionMode(
  isTerrainEnabled: boolean,
  isExtrusionEnabled: boolean,
): MapDimensionMode {
  if (isExtrusionEnabled) return 'extrusion'
  return isTerrainEnabled ? 'terrain' : '2d'
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * `<extrusion>:<metric>:<scale>:<exaggeration>:<hillshade>`. Every field falls
 * back independently, so one malformed segment cannot discard the rest.
 */
export function parseMap3dState(value: string | null): Map3dState {
  if (!value) return DEFAULT_MAP_3D_STATE

  const [extrusion, metric, scale, exaggeration, hillshade] = value.split(':')

  return {
    isExtrusionEnabled: extrusion === '1',
    extrusionMetric: isMapExtrusionMetric(metric)
      ? metric
      : DEFAULT_MAP_3D_STATE.extrusionMetric,
    extrusionScale: clampExtrusionScale(Number(scale)),
    terrainExaggeration: clampTerrainExaggeration(Number(exaggeration)),
    hillshadeVisible: hillshade !== '0',
  }
}

export function serializeMap3dState(state: Map3dState): string | undefined {
  const isDefault =
    state.isExtrusionEnabled === DEFAULT_MAP_3D_STATE.isExtrusionEnabled &&
    state.extrusionMetric === DEFAULT_MAP_3D_STATE.extrusionMetric &&
    state.extrusionScale === DEFAULT_MAP_3D_STATE.extrusionScale &&
    state.terrainExaggeration === DEFAULT_MAP_3D_STATE.terrainExaggeration &&
    state.hillshadeVisible === DEFAULT_MAP_3D_STATE.hillshadeVisible

  return isDefault
    ? undefined
    : [
        state.isExtrusionEnabled ? '1' : '0',
        state.extrusionMetric,
        String(round(state.extrusionScale)),
        String(round(state.terrainExaggeration)),
        state.hillshadeVisible ? '1' : '0',
      ].join(':')
}
