import {
  DEFAULT_MAP_3D_STATE,
  MAX_EXTRUSION_SCALE,
  MIN_EXTRUSION_SCALE,
  clampExtrusionScale,
  clampTerrainExaggeration,
  dimensionMode,
  isMapExtrusionMetric,
  parseMap3dState,
  serializeMap3dState,
} from './map3dState'
import {
  DEFAULT_TERRAIN_EXAGGERATION,
  MAX_TERRAIN_EXAGGERATION,
} from './mapTerrainLayers'

describe('defaults', () => {
  it('starts as a normal 2D map', () => {
    expect(DEFAULT_MAP_3D_STATE.isExtrusionEnabled).toBe(false)
    expect(dimensionMode(false, false)).toBe('2d')
  })

  it('serializes to nothing while everything is default', () => {
    expect(serializeMap3dState(DEFAULT_MAP_3D_STATE)).toBeUndefined()
  })
})

describe('dimensionMode', () => {
  it.each([
    [false, false, '2d'],
    [true, false, 'terrain'],
    [false, true, 'extrusion'],
    [true, true, 'extrusion'],
  ] as const)('derives %s/%s as %s', (isTerrain, isExtrusion, expected) => {
    expect(dimensionMode(isTerrain, isExtrusion)).toBe(expected)
  })
})

describe('clamping', () => {
  it('bounds the extrusion scale', () => {
    expect(clampExtrusionScale(0)).toBe(MIN_EXTRUSION_SCALE)
    expect(clampExtrusionScale(99)).toBe(MAX_EXTRUSION_SCALE)
    expect(clampExtrusionScale(1.3)).toBe(1.3)
  })

  it('keeps terrain exaggeration restrained', () => {
    expect(clampTerrainExaggeration(0.1)).toBe(0.5)
    expect(clampTerrainExaggeration(50)).toBe(MAX_TERRAIN_EXAGGERATION)
  })

  it.each([Number.NaN, Number.POSITIVE_INFINITY])(
    'falls back for %s',
    (value) => {
      expect(clampExtrusionScale(value)).toBe(
        DEFAULT_MAP_3D_STATE.extrusionScale,
      )
      expect(clampTerrainExaggeration(value)).toBe(DEFAULT_TERRAIN_EXAGGERATION)
    },
  )
})

describe('isMapExtrusionMetric', () => {
  it('accepts supported metrics and rejects anything else', () => {
    expect(isMapExtrusionMetric('log-fragments')).toBe(true)
    expect(isMapExtrusionMetric('building-height')).toBe(false)
    expect(isMapExtrusionMetric(null)).toBe(false)
  })
})

describe('url round trip', () => {
  const state = {
    isExtrusionEnabled: true,
    extrusionMetric: 'fragment-density' as const,
    extrusionScale: 1.5,
    terrainExaggeration: 1.8,
    hillshadeVisible: false,
  }

  it('survives serialize then parse', () => {
    expect(parseMap3dState(serializeMap3dState(state) ?? null)).toEqual(state)
  })

  it('restores an extrusion view from a url', () => {
    expect(parseMap3dState('1:mapped-findspots:1:1.4:1')).toMatchObject({
      isExtrusionEnabled: true,
      extrusionMetric: 'mapped-findspots',
    })
  })
})

describe('malformed url values', () => {
  it('falls back to defaults for an empty value', () => {
    expect(parseMap3dState(null)).toEqual(DEFAULT_MAP_3D_STATE)
    expect(parseMap3dState('')).toEqual(DEFAULT_MAP_3D_STATE)
  })

  it('falls back per field rather than discarding the whole value', () => {
    expect(parseMap3dState('1:building-height:nonsense:nonsense:0')).toEqual({
      isExtrusionEnabled: true,
      extrusionMetric: DEFAULT_MAP_3D_STATE.extrusionMetric,
      extrusionScale: DEFAULT_MAP_3D_STATE.extrusionScale,
      terrainExaggeration: DEFAULT_MAP_3D_STATE.terrainExaggeration,
      hillshadeVisible: false,
    })
  })

  it('treats a truncated value as 2D with defaults', () => {
    expect(parseMap3dState('0')).toEqual(DEFAULT_MAP_3D_STATE)
  })
})
