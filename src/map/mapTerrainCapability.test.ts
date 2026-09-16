import { setReducedMotionMatchMedia } from 'test-support/matchMedia'
import {
  deriveTerrainCapability,
  isLowPowerDevice,
  terrainExaggeration,
} from './mapTerrainCapability'
import {
  DEFAULT_TERRAIN_EXAGGERATION,
  REDUCED_MOTION_TERRAIN_EXAGGERATION,
} from './mapTerrainLayers'
import { AWS_TERRAIN_TILES } from './mapTerrainSource'

function setDeviceCapability(
  deviceMemory: number | undefined,
  hardwareConcurrency: number | undefined,
): () => void {
  const descriptors = {
    deviceMemory: Object.getOwnPropertyDescriptor(navigator, 'deviceMemory'),
    hardwareConcurrency: Object.getOwnPropertyDescriptor(
      navigator,
      'hardwareConcurrency',
    ),
  }

  Object.defineProperty(navigator, 'deviceMemory', {
    configurable: true,
    value: deviceMemory,
  })
  Object.defineProperty(navigator, 'hardwareConcurrency', {
    configurable: true,
    value: hardwareConcurrency,
  })

  return () => {
    for (const [key, descriptor] of Object.entries(descriptors)) {
      if (descriptor) {
        Object.defineProperty(navigator, key, descriptor)
      } else {
        Reflect.deleteProperty(navigator, key)
      }
    }
  }
}

describe('isLowPowerDevice', () => {
  it.each([
    ['scarce memory', 1, 8, true],
    ['few cores', 8, 2, true],
    ['ample resources', 8, 8, false],
    ['unreported capability', undefined, undefined, false],
  ])('is %s → %s', (_name, deviceMemory, hardwareConcurrency, expected) => {
    const restore = setDeviceCapability(
      deviceMemory as number | undefined,
      hardwareConcurrency as number | undefined,
    )
    expect(isLowPowerDevice()).toBe(expected)
    restore()
  })
})

describe('terrainExaggeration', () => {
  it('is restrained under reduced motion', () => {
    const restore = setReducedMotionMatchMedia(true)
    expect(terrainExaggeration()).toBe(REDUCED_MOTION_TERRAIN_EXAGGERATION)
    restore()
  })

  it('uses the default otherwise', () => {
    const restore = setReducedMotionMatchMedia(false)
    expect(terrainExaggeration()).toBe(DEFAULT_TERRAIN_EXAGGERATION)
    restore()
  })
})

describe('deriveTerrainCapability', () => {
  let restoreDevice = (): void => undefined

  afterEach(() => restoreDevice())

  it('supports terrain on a capable device with an approved source', () => {
    restoreDevice = setDeviceCapability(8, 8)

    expect(deriveTerrainCapability()).toMatchObject({
      isSupported: true,
      source: AWS_TERRAIN_TILES,
      unavailableReason: null,
    })
  })

  it('withholds terrain when no source is approved', () => {
    restoreDevice = setDeviceCapability(8, 8)

    expect(deriveTerrainCapability(null)).toEqual({
      isSupported: false,
      source: null,
      exaggeration: DEFAULT_TERRAIN_EXAGGERATION,
      unavailableReason: 'no-approved-source',
    })
  })

  it('withholds terrain on a low-power device but keeps the source visible', () => {
    restoreDevice = setDeviceCapability(1, 2)

    expect(deriveTerrainCapability()).toMatchObject({
      isSupported: false,
      source: AWS_TERRAIN_TILES,
      unavailableReason: 'low-power-device',
    })
  })
})
