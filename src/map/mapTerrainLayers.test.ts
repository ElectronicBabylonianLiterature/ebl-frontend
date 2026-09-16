import {
  DEFAULT_TERRAIN_EXAGGERATION,
  MAX_TERRAIN_EXAGGERATION,
  TERRAIN_HILLSHADE_LAYER_ID,
  TERRAIN_SOURCE_ID,
  type TerrainMapLike,
  clampExaggeration,
  createHillshadeLayer,
  createTerrainSource,
  disableTerrain,
  enableTerrain,
} from './mapTerrainLayers'
import { AWS_TERRAIN_TILES } from './mapTerrainSource'

interface FakeMap extends TerrainMapLike {
  readonly sources: Map<string, unknown>
  readonly layers: Map<string, unknown>
  readonly addedBefore: (string | undefined)[]
  terrain: unknown
}

function fakeMap(existingLayerIds: readonly string[] = []): FakeMap {
  const sources = new Map<string, unknown>()
  const layers = new Map<string, unknown>(
    existingLayerIds.map((id) => [id, { id }]),
  )
  const addedBefore: (string | undefined)[] = []

  return {
    sources,
    layers,
    addedBefore,
    terrain: undefined,
    addSource: ((id: string, source: unknown) => {
      sources.set(id, source)
    }) as TerrainMapLike['addSource'],
    getSource: ((id: string) => sources.get(id)) as TerrainMapLike['getSource'],
    removeSource: ((id: string) => {
      sources.delete(id)
    }) as TerrainMapLike['removeSource'],
    setLayoutProperty: ((id: string, property: string, value: unknown) => {
      const layer = layers.get(id) as Record<string, unknown> | undefined
      if (layer) layers.set(id, { ...layer, [property]: value })
    }) as TerrainMapLike['setLayoutProperty'],
    addLayer: ((layer: { id: string }, before?: string) => {
      layers.set(layer.id, layer)
      addedBefore.push(before)
    }) as unknown as TerrainMapLike['addLayer'],
    getLayer: ((id: string) => layers.get(id)) as TerrainMapLike['getLayer'],
    removeLayer: ((id: string) => {
      layers.delete(id)
    }) as TerrainMapLike['removeLayer'],
    setTerrain(terrain) {
      this.terrain = terrain
    },
  }
}

describe('clampExaggeration', () => {
  it.each([
    [1.4, 1.4],
    [-3, 0],
    [99, MAX_TERRAIN_EXAGGERATION],
    [Number.NaN, DEFAULT_TERRAIN_EXAGGERATION],
  ])('clamps %s to %s', (input, expected) => {
    expect(clampExaggeration(input)).toBe(expected)
  })
})

describe('createTerrainSource', () => {
  it('carries the raster-dem contract and its attribution', () => {
    expect(createTerrainSource(AWS_TERRAIN_TILES)).toEqual({
      type: 'raster-dem',
      tiles: [...AWS_TERRAIN_TILES.tiles],
      encoding: 'terrarium',
      tileSize: 256,
      minzoom: 0,
      maxzoom: 15,
      attribution: AWS_TERRAIN_TILES.attribution,
    })
  })
})

describe('createHillshadeLayer', () => {
  it('renders from the terrain source', () => {
    expect(createHillshadeLayer()).toMatchObject({
      id: TERRAIN_HILLSHADE_LAYER_ID,
      type: 'hillshade',
      source: TERRAIN_SOURCE_ID,
    })
  })
})

describe('enableTerrain', () => {
  it('adds the source, hillshade and terrain once', () => {
    const map = fakeMap()

    enableTerrain(map, AWS_TERRAIN_TILES, 1.4)
    enableTerrain(map, AWS_TERRAIN_TILES, 1.4)

    expect(map.sources.size).toBe(1)
    expect(map.layers.size).toBe(1)
    expect(map.terrain).toEqual({
      source: TERRAIN_SOURCE_ID,
      exaggeration: 1.4,
    })
  })

  it('inserts the hillshade under an existing layer when one is given', () => {
    const map = fakeMap(['ebl-findspot-polygon-fill'])

    enableTerrain(map, AWS_TERRAIN_TILES, 1, 'ebl-findspot-polygon-fill')

    expect(map.addedBefore).toEqual(['ebl-findspot-polygon-fill'])
  })

  it('appends the hillshade when the requested anchor layer is absent', () => {
    const map = fakeMap()

    enableTerrain(map, AWS_TERRAIN_TILES, 1, 'missing-layer')

    expect(map.addedBefore).toEqual([undefined])
  })

  it('clamps an out-of-range exaggeration', () => {
    const map = fakeMap()

    enableTerrain(map, AWS_TERRAIN_TILES, 40)

    expect(map.terrain).toEqual({
      source: TERRAIN_SOURCE_ID,
      exaggeration: MAX_TERRAIN_EXAGGERATION,
    })
  })
})

describe('disableTerrain', () => {
  it('removes terrain, the hillshade layer and the source', () => {
    const map = fakeMap()
    enableTerrain(map, AWS_TERRAIN_TILES, 1.4)

    disableTerrain(map)

    expect(map.terrain).toBeNull()
    expect(map.layers.size).toBe(0)
    expect(map.sources.size).toBe(0)
  })

  it('is safe when terrain was never enabled', () => {
    const map = fakeMap()

    disableTerrain(map)

    expect(map.terrain).toBeNull()
    expect(map.sources.size).toBe(0)
  })
})
