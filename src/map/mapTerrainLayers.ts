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

interface TerrainLayerOptions {
  readonly beforeLayerId?: string
  readonly isHillshadeVisible?: boolean
}

export function enableTerrain(
  map: TerrainMapLike,
  source: TerrainSourceDefinition,
  exaggeration: number,
  ownership: TerrainOwnership,
  options: TerrainLayerOptions = {},
): void {
  const { beforeLayerId, isHillshadeVisible = true } = options
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
  releaseOwnedResource(ownership, 'terrain', () => map.setTerrain(null))
  releaseOwnedResource(ownership, 'hillshadeLayer', () => {
    if (map.getLayer(TERRAIN_HILLSHADE_LAYER_ID)) {
      map.removeLayer(TERRAIN_HILLSHADE_LAYER_ID)
    }
  })

  for (const [id, key] of [
    [TERRAIN_HILLSHADE_SOURCE_ID, 'hillshadeSource'],
    [TERRAIN_SOURCE_ID, 'terrainSource'],
  ] as const) {
    releaseOwnedResource(ownership, key, () => {
      if (map.getSource(id)) map.removeSource(id)
    })
  }
  return !Object.values(ownership).some(Boolean)
}

function releaseOwnedResource(
  ownership: TerrainOwnership,
  key: keyof TerrainOwnership,
  release: () => void,
): void {
  if (!ownership[key]) return
  try {
    release()
    ownership[key] = false
  } catch {
    return
  }
}

export function releaseTerrainOwnership(ownership: TerrainOwnership): void {
  ownership.terrain = false
  ownership.terrainSource = false
  ownership.hillshadeSource = false
  ownership.hillshadeLayer = false
}
