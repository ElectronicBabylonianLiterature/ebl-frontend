import {
  DEFAULT_TERRAIN_EXAGGERATION,
  MAX_TERRAIN_EXAGGERATION,
  TERRAIN_HILLSHADE_LAYER_ID,
  TERRAIN_HILLSHADE_SOURCE_ID,
  TERRAIN_SOURCE_ID,
  type TerrainMapLike,
  clampExaggeration,
  createHillshadeLayer,
  createTerrainOwnership,
  createTerrainSource,
  disableTerrain,
  enableTerrain,
} from 'map/mapTerrainLayers'
import { AWS_TERRAIN_TILES } from 'map/mapTerrainSource'

interface FakeMap extends TerrainMapLike {
  readonly sources: Map<string, unknown>
  readonly layers: Map<string, unknown>
  readonly addedBefore: (string | undefined)[]
  terrain: unknown
}

function fakeMap(existingLayerIds: readonly string[] = []): FakeMap {
  const sources = new Map<string, unknown>()
  const layers = new Map<string, Record<string, unknown>>(
    existingLayerIds.map((id) => [id, { id }]),
  )
  const addedBefore: (string | undefined)[] = []
  return {
    sources,
    layers,
    addedBefore,
    terrain: undefined,
    addSource(id, source) {
      sources.set(id, source)
    },
    getSource: (id) => sources.get(id),
    removeSource(id) {
      sources.delete(id)
    },
    setLayoutProperty(id, property, value) {
      const layer = layers.get(id)
      if (layer) layers.set(id, { ...layer, [property]: value })
    },
    addLayer(layer, before) {
      layers.set(layer.id, layer)
      addedBefore.push(before)
    },
    getLayer: (id) => layers.get(id),
    removeLayer(id) {
      layers.delete(id)
    },
    setTerrain(terrain) {
      this.terrain = terrain
    },
  }
}

function enable(map: FakeMap, exaggeration = 1.4) {
  const ownership = createTerrainOwnership()
  enableTerrain(map, AWS_TERRAIN_TILES, exaggeration, ownership)
  return ownership
}

describe('terrain definitions', () => {
  it.each([
    [1.4, 1.4],
    [-3, 0],
    [99, MAX_TERRAIN_EXAGGERATION],
    [Number.NaN, DEFAULT_TERRAIN_EXAGGERATION],
  ])('clamps %s to %s', (input, expected) => {
    expect(clampExaggeration(input)).toBe(expected)
  })

  it('carries the raster-dem contract and attribution', () => {
    expect(createTerrainSource(AWS_TERRAIN_TILES)).toMatchObject({
      type: 'raster-dem',
      encoding: 'terrarium',
      tileSize: 256,
      attribution: AWS_TERRAIN_TILES.attribution,
    })
  })

  it('uses a dedicated raster-dem source for hillshade', () => {
    expect(createHillshadeLayer()).toMatchObject({
      id: TERRAIN_HILLSHADE_LAYER_ID,
      type: 'hillshade',
      source: TERRAIN_HILLSHADE_SOURCE_ID,
    })
  })
})

describe('enableTerrain', () => {
  it('adds dedicated sources, hillshade, and terrain idempotently', () => {
    const map = fakeMap()
    const ownership = createTerrainOwnership()

    enableTerrain(map, AWS_TERRAIN_TILES, 1.4, ownership)
    enableTerrain(map, AWS_TERRAIN_TILES, 1.4, ownership)

    expect([...map.sources.keys()]).toEqual([
      TERRAIN_SOURCE_ID,
      TERRAIN_HILLSHADE_SOURCE_ID,
    ])
    expect(map.layers.size).toBe(1)
    expect(map.terrain).toEqual({
      source: TERRAIN_SOURCE_ID,
      exaggeration: 1.4,
    })
  })

  it('inserts hillshade under an existing anchor layer', () => {
    const map = fakeMap(['ebl-findspot-polygon-fill'])
    enableTerrain(
      map,
      AWS_TERRAIN_TILES,
      1,
      createTerrainOwnership(),
      'ebl-findspot-polygon-fill',
    )
    expect(map.addedBefore).toEqual(['ebl-findspot-polygon-fill'])
  })

  it('reinstalls owned resources after a style reload', () => {
    const map = fakeMap()
    const ownership = enable(map)
    map.sources.clear()
    map.layers.clear()

    enableTerrain(map, AWS_TERRAIN_TILES, 1.4, ownership)

    expect(map.sources.size).toBe(2)
    expect(map.layers.size).toBe(1)
  })

  it('rejects foreign source and layer id collisions', () => {
    const sourceCollision = fakeMap()
    sourceCollision.sources.set(TERRAIN_SOURCE_ID, { foreign: true })
    expect(() => enable(sourceCollision)).toThrow('source id collision')

    const layerCollision = fakeMap([TERRAIN_HILLSHADE_LAYER_ID])
    expect(() => enable(layerCollision)).toThrow('layer id collision')
  })
})

describe('disableTerrain', () => {
  it('removes only resources owned by this lifecycle', () => {
    const map = fakeMap()
    const ownership = enable(map)
    expect(disableTerrain(map, ownership)).toBe(true)
    expect(map.terrain).toBeNull()
    expect(map.layers.size).toBe(0)
    expect(map.sources.size).toBe(0)
  })

  it('preserves ownership and retries a failed terrain teardown', () => {
    const map = fakeMap()
    const ownership = enable(map)
    const setTerrain = map.setTerrain
    map.setTerrain = () => {
      throw new Error('style transition')
    }

    expect(disableTerrain(map, ownership)).toBe(false)
    expect(ownership.terrain).toBe(true)

    map.setTerrain = setTerrain
    expect(disableTerrain(map, ownership)).toBe(true)
    expect(map.terrain).toBeNull()
  })

  it('reports partial source cleanup without claiming terrain is active', () => {
    const map = fakeMap()
    const ownership = enable(map)
    map.removeSource = () => {
      throw new Error('source busy')
    }

    expect(disableTerrain(map, ownership)).toBe(false)
    expect(ownership.terrain).toBe(false)
    expect(ownership.terrainSource).toBe(true)
    expect(map.terrain).toBeNull()
  })

  it('does not remove colliding foreign resources', () => {
    const map = fakeMap([TERRAIN_HILLSHADE_LAYER_ID])
    map.sources.set(TERRAIN_SOURCE_ID, { foreign: true })
    map.sources.set(TERRAIN_HILLSHADE_SOURCE_ID, { foreign: true })

    expect(disableTerrain(map, createTerrainOwnership())).toBe(true)

    expect(map.layers.has(TERRAIN_HILLSHADE_LAYER_ID)).toBe(true)
    expect(map.sources.size).toBe(2)
    expect(map.terrain).toBeUndefined()
  })
})
