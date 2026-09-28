import type {
  LayerSpecification,
  RasterDEMSourceSpecification,
  TerrainSpecification,
} from 'maplibre-gl'
import type { TerrainSourceDefinition } from 'map/mapTerrainSource'

export const TERRAIN_SOURCE_ID = 'ebl-terrain-dem'
export const TERRAIN_HILLSHADE_SOURCE_ID = 'ebl-terrain-hillshade-dem'
export const TERRAIN_HILLSHADE_LAYER_ID = 'ebl-terrain-hillshade'

export const DEFAULT_TERRAIN_EXAGGERATION = 1.4
export const REDUCED_MOTION_TERRAIN_EXAGGERATION = 1
export const MAX_TERRAIN_EXAGGERATION = 2.5

export interface TerrainOwnership {
  terrain: boolean
  terrainSource: boolean
  hillshadeSource: boolean
  hillshadeLayer: boolean
}

type HillshadeLayerSpecification = Extract<
  LayerSpecification,
  { type: 'hillshade' }
>

export interface TerrainMapLike {
  addSource(id: string, source: RasterDEMSourceSpecification): unknown
  getSource(id: string): unknown
  removeSource(id: string): unknown
  addLayer(layer: HillshadeLayerSpecification, beforeId?: string): unknown
  getLayer(id: string): unknown
  removeLayer(id: string): unknown
  setLayoutProperty(id: string, name: string, value: unknown): unknown
  setTerrain(terrain: TerrainSpecification | null): unknown
}

export function createTerrainOwnership(): TerrainOwnership {
  return {
    terrain: false,
    terrainSource: false,
    hillshadeSource: false,
    hillshadeLayer: false,
  }
}

export function clampExaggeration(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_TERRAIN_EXAGGERATION
  return Math.min(Math.max(value, 0), MAX_TERRAIN_EXAGGERATION)
}

export function createTerrainSource(
  source: TerrainSourceDefinition,
): RasterDEMSourceSpecification {
  return {
    type: 'raster-dem',
    tiles: [...source.tiles],
    encoding: source.encoding,
    tileSize: source.tileSize,
    minzoom: source.minZoom,
    maxzoom: source.maxZoom,
    attribution: source.attribution,
  }
}

export function createHillshadeLayer(): HillshadeLayerSpecification {
  return {
    id: TERRAIN_HILLSHADE_LAYER_ID,
    type: 'hillshade',
    source: TERRAIN_HILLSHADE_SOURCE_ID,
    paint: {
      'hillshade-exaggeration': 0.35,
      'hillshade-shadow-color': '#4a4133',
      'hillshade-highlight-color': '#fdf7ec',
    },
  }
}

export function setHillshadeVisibility(
  map: TerrainMapLike,
  isVisible: boolean,
): void {
  if (!map.getLayer(TERRAIN_HILLSHADE_LAYER_ID)) return
  map.setLayoutProperty(
    TERRAIN_HILLSHADE_LAYER_ID,
    'visibility',
    isVisible ? 'visible' : 'none',
  )
}

function addOwnedSource(
  map: TerrainMapLike,
  id: string,
  source: TerrainSourceDefinition,
  owned: boolean,
): boolean {
  if (map.getSource(id)) {
    if (!owned) throw new Error(`Terrain source id collision: ${id}`)
    return true
  }
  map.addSource(id, createTerrainSource(source))
  return true
}

export function enableTerrain(
  map: TerrainMapLike,
  source: TerrainSourceDefinition,
  exaggeration: number,
  ownership: TerrainOwnership,
  beforeLayerId?: string,
  isHillshadeVisible = true,
): void {
  ownership.terrainSource = addOwnedSource(
    map,
    TERRAIN_SOURCE_ID,
    source,
    ownership.terrainSource,
  )
  ownership.hillshadeSource = addOwnedSource(
    map,
    TERRAIN_HILLSHADE_SOURCE_ID,
    source,
    ownership.hillshadeSource,
  )

  if (map.getLayer(TERRAIN_HILLSHADE_LAYER_ID)) {
    if (!ownership.hillshadeLayer) {
      throw new Error(
        `Terrain layer id collision: ${TERRAIN_HILLSHADE_LAYER_ID}`,
      )
    }
  } else {
    const layer = createHillshadeLayer()
    map.addLayer(
      layer,
      beforeLayerId !== undefined && map.getLayer(beforeLayerId)
        ? beforeLayerId
        : undefined,
    )
    ownership.hillshadeLayer = true
  }

  setHillshadeVisibility(map, isHillshadeVisible)
  map.setTerrain({
    source: TERRAIN_SOURCE_ID,
    exaggeration: clampExaggeration(exaggeration),
  })
  ownership.terrain = true
}

export function disableTerrain(
  map: TerrainMapLike,
  ownership: TerrainOwnership,
): boolean {
  if (ownership.terrain) {
    try {
      map.setTerrain(null)
      ownership.terrain = false
    } catch {
      // Preserve ownership so cleanup can retry after the style transition.
    }
  }

  if (ownership.hillshadeLayer) {
    try {
      if (map.getLayer(TERRAIN_HILLSHADE_LAYER_ID)) {
        map.removeLayer(TERRAIN_HILLSHADE_LAYER_ID)
      }
      ownership.hillshadeLayer = false
    } catch {
      // Preserve ownership so cleanup can retry after the style transition.
    }
  }

  for (const [id, key] of [
    [TERRAIN_HILLSHADE_SOURCE_ID, 'hillshadeSource'],
    [TERRAIN_SOURCE_ID, 'terrainSource'],
  ] as const) {
    if (ownership[key]) {
      try {
        if (map.getSource(id)) map.removeSource(id)
        ownership[key] = false
      } catch {
        // Preserve ownership so cleanup can retry after the style transition.
      }
    }
  }
  return !Object.values(ownership).some(Boolean)
}

export function releaseTerrainOwnership(ownership: TerrainOwnership): void {
  ownership.terrain = false
  ownership.terrainSource = false
  ownership.hillshadeSource = false
  ownership.hillshadeLayer = false
}
