import prefersReducedMotion from 'common/utils/prefersReducedMotion'
import {
  DEFAULT_TERRAIN_EXAGGERATION,
  REDUCED_MOTION_TERRAIN_EXAGGERATION,
} from './mapTerrainLayers'
import {
  type TerrainSourceDefinition,
  approvedTerrainSource,
} from './mapTerrainSource'

export const MINIMUM_TERRAIN_DEVICE_MEMORY_GB = 2
export const MINIMUM_TERRAIN_LOGICAL_CORES = 4

export type TerrainUnavailableReason = 'no-approved-source' | 'low-power-device'

export interface TerrainCapability {
  readonly isSupported: boolean
  readonly source: TerrainSourceDefinition | null
  readonly exaggeration: number
  readonly unavailableReason: TerrainUnavailableReason | null
}

interface DeviceCapabilityLike {
  readonly deviceMemory?: number
  readonly hardwareConcurrency?: number
}

export function isLowPowerDevice(): boolean {
  const { deviceMemory, hardwareConcurrency } =
    navigator as unknown as DeviceCapabilityLike

  return (
    (typeof deviceMemory === 'number' &&
      deviceMemory < MINIMUM_TERRAIN_DEVICE_MEMORY_GB) ||
    (typeof hardwareConcurrency === 'number' &&
      hardwareConcurrency < MINIMUM_TERRAIN_LOGICAL_CORES)
  )
}

export function terrainExaggeration(): number {
  return prefersReducedMotion()
    ? REDUCED_MOTION_TERRAIN_EXAGGERATION
    : DEFAULT_TERRAIN_EXAGGERATION
}

export function deriveTerrainCapability(
  source: TerrainSourceDefinition | null = approvedTerrainSource(),
): TerrainCapability {
  if (source === null) {
    return {
      isSupported: false,
      source: null,
      exaggeration: DEFAULT_TERRAIN_EXAGGERATION,
      unavailableReason: 'no-approved-source',
    }
  }

  if (isLowPowerDevice()) {
    return {
      isSupported: false,
      source,
      exaggeration: terrainExaggeration(),
      unavailableReason: 'low-power-device',
    }
  }

  return {
    isSupported: true,
    source,
    exaggeration: terrainExaggeration(),
    unavailableReason: null,
  }
}
