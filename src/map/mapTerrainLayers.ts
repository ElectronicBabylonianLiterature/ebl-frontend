import type { Map as MapLibreMap } from 'maplibre-gl'
import type { TerrainSourceDefinition } from './mapTerrainSource'

export const TERRAIN_SOURCE_ID = 'ebl-terrain-dem'
export const TERRAIN_HILLSHADE_LAYER_ID = 'ebl-terrain-hillshade'

export const DEFAULT_TERRAIN_EXAGGERATION = 1.4
export const REDUCED_MOTION_TERRAIN_EXAGGERATION = 1
export const MAX_TERRAIN_EXAGGERATION = 2.5

export interface TerrainMapLike {
  addSource: MapLibreMap['addSource']
  getSource: MapLibreMap['getSource']
  removeSource: MapLibreMap['removeSource']
  addLayer: MapLibreMap['addLayer']
  getLayer: MapLibreMap['getLayer']
  removeLayer: MapLibreMap['removeLayer']
  setLayoutProperty: MapLibreMap['setLayoutProperty']
  setTerrain: (terrain: { source: string; exaggeration: number } | null) => void
}

export function clampExaggeration(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_TERRAIN_EXAGGERATION
  return Math.min(Math.max(value, 0), MAX_TERRAIN_EXAGGERATION)
}

export function createTerrainSource(
  source: TerrainSourceDefinition,
): Record<string, unknown> {
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

export function createHillshadeLayer(): Record<string, unknown> {
  return {
    id: TERRAIN_HILLSHADE_LAYER_ID,
    type: 'hillshade',
    source: TERRAIN_SOURCE_ID,
    paint: {
      'hillshade-exaggeration': 0.35,
      'hillshade-shadow-color': '#4a4133',
      'hillshade-highlight-color': '#fdf7ec',
    },
  }
}

/**
 * Hillshade is toggled through layer visibility rather than by removing it, so
 * turning relief off and on again never re-adds a layer above the excavation
 * polygons it must stay beneath.
 */
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

export function enableTerrain(
  map: TerrainMapLike,
  source: TerrainSourceDefinition,
  exaggeration: number,
  beforeLayerId?: string,
  isHillshadeVisible = true,
): void {
  if (!map.getSource(TERRAIN_SOURCE_ID)) {
    map.addSource(
      TERRAIN_SOURCE_ID,
      createTerrainSource(source) as Parameters<MapLibreMap['addSource']>[1],
    )
  }

  if (!map.getLayer(TERRAIN_HILLSHADE_LAYER_ID)) {
    const layer = createHillshadeLayer() as Parameters<
      MapLibreMap['addLayer']
    >[0]
    if (beforeLayerId !== undefined && map.getLayer(beforeLayerId)) {
      map.addLayer(layer, beforeLayerId)
    } else {
      map.addLayer(layer)
    }
  }

  setHillshadeVisibility(map, isHillshadeVisible)

  map.setTerrain({
    source: TERRAIN_SOURCE_ID,
    exaggeration: clampExaggeration(exaggeration),
  })
}

export function disableTerrain(map: TerrainMapLike): void {
  map.setTerrain(null)

  if (map.getLayer(TERRAIN_HILLSHADE_LAYER_ID)) {
    map.removeLayer(TERRAIN_HILLSHADE_LAYER_ID)
  }

  if (map.getSource(TERRAIN_SOURCE_ID)) {
    map.removeSource(TERRAIN_SOURCE_ID)
  }
}
