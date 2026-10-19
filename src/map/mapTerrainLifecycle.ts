import type { MutableRefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { EXCAVATION_AREA_FILL_LAYER_ID } from 'map/mapLayerIds'
import type { TerrainSourceDefinition } from 'map/mapTerrainSource'
import {
  TERRAIN_HILLSHADE_LAYER_ID,
  TERRAIN_HILLSHADE_SOURCE_ID,
  TERRAIN_SOURCE_ID,
  type TerrainOwnership,
  disableTerrain,
  enableTerrain,
  releaseTerrainOwnership,
} from 'map/mapTerrainLayers'

interface TerrainLifecycleOptions {
  readonly mapRef: MutableRefObject<MapLibreMap | null>
  readonly ownership: TerrainOwnership
  readonly source: TerrainSourceDefinition | null
  readonly isRequested: boolean
  readonly exaggeration: number
  readonly isHillshadeVisible: boolean
  readonly onEnabledChange: (isEnabled: boolean) => void
  readonly onErrorChange: (message: string | null) => void
  readonly onUnavailable: () => void
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object'
}

function isTerrainError(event: unknown): boolean {
  if (!isRecord(event)) return false
  const layer = isRecord(event.layer) ? event.layer : null
  return (
    event.sourceId === TERRAIN_SOURCE_ID ||
    event.sourceId === TERRAIN_HILLSHADE_SOURCE_ID ||
    layer?.id === TERRAIN_HILLSHADE_LAYER_ID
  )
}

export default class MapTerrainLifecycle {
  private isActive = true
  private hasFailed = false

  constructor(
    private readonly map: MapLibreMap,
    private readonly options: TerrainLifecycleOptions,
  ) {}

  start(): void {
    this.map.on('style.load', this.handleStyleLoad)
    this.map.on('error', this.handleError)
    if (this.options.isRequested) {
      this.options.onErrorChange(null)
      this.enable()
    } else {
      this.disable()
    }
  }

  dispose(): void {
    this.isActive = false
    this.map.off('style.load', this.handleStyleLoad)
    this.map.off('error', this.handleError)
    this.disable()
  }

  private ownsMap(): boolean {
    return this.options.mapRef.current === this.map
  }

  private isCurrent(): boolean {
    return this.isActive && this.ownsMap()
  }

  private disable(): void {
    if (!this.ownsMap()) return
    const isClean = disableTerrain(this.map, this.options.ownership)
    if (!this.isActive) return
    this.options.onEnabledChange(this.options.ownership.terrain)
    if (!isClean) {
      this.options.onErrorChange(
        'Terrain changed, but some map resources could not be released.',
      )
    }
  }

  private fail(message: string): void {
    if (this.hasFailed || !this.isCurrent()) return
    this.hasFailed = true
    this.disable()
    this.options.onErrorChange(message)
    this.options.onUnavailable()
  }

  private enable(): void {
    const { source, ownership, exaggeration, isHillshadeVisible, isRequested } =
      this.options
    if (!this.isCurrent() || !isRequested || !this.map.getStyle() || !source)
      return
    if (ownership.terrain) {
      this.options.onEnabledChange(true)
      return
    }
    try {
      enableTerrain(this.map, source, exaggeration, ownership, {
        beforeLayerId: EXCAVATION_AREA_FILL_LAYER_ID,
        isHillshadeVisible,
      })
      this.options.onEnabledChange(true)
    } catch (error) {
      this.fail(
        error instanceof Error ? error.message : 'Terrain setup failed.',
      )
    }
  }

  private handleError = (event?: unknown): void => {
    if (isTerrainError(event)) this.fail('Elevation tiles could not be loaded.')
  }

  private handleStyleLoad = (): void => {
    if (!this.isCurrent()) return
    releaseTerrainOwnership(this.options.ownership)
    this.options.onEnabledChange(false)
    this.options.onErrorChange(null)
    if (this.options.isRequested) this.enable()
  }
}
