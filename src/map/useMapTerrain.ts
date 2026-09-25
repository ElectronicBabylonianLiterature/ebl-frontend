import { useEffect, useMemo, useRef, useState } from 'react'
import type { MutableRefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { EXCAVATION_AREA_FILL_LAYER_ID } from 'map/mapLayerIds'
import {
  TERRAIN_HILLSHADE_LAYER_ID,
  TERRAIN_HILLSHADE_SOURCE_ID,
  TERRAIN_SOURCE_ID,
  type TerrainMapLike,
  createTerrainOwnership,
  disableTerrain,
  enableTerrain,
  releaseTerrainOwnership,
} from 'map/mapTerrainLayers'
import {
  type TerrainCapability,
  deriveTerrainCapability,
} from 'map/mapTerrainCapability'

export type TerrainRuntimeStatus =
  | 'off'
  | 'loading'
  | 'enabled'
  | 'error'
  | 'unavailable'

export interface MapTerrainResult extends TerrainCapability {
  readonly isEnabled: boolean
  readonly status: TerrainRuntimeStatus
  readonly errorMessage: string | null
}

function asTerrainMap(map: MapLibreMap): TerrainMapLike | null {
  return typeof map.setTerrain === 'function' ? map : null
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

export interface MapTerrainOptions {
  readonly exaggeration?: number
  readonly isHillshadeVisible?: boolean
  readonly onUnavailable?: () => void
}

export default function useMapTerrain(
  mapRef: MutableRefObject<MapLibreMap | null>,
  isRequested: boolean,
  options: MapTerrainOptions = {},
): MapTerrainResult {
  const capability = useMemo(() => deriveTerrainCapability(), [])
  const ownership = useRef(createTerrainOwnership())
  const onUnavailable = useRef(options.onUnavailable)
  const [isEnabled, setIsEnabled] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const exaggeration = options.exaggeration ?? capability.exaggeration
  const isHillshadeVisible = options.isHillshadeVisible ?? true
  onUnavailable.current = options.onUnavailable

  useEffect(() => {
    if (!capability.isSupported) {
      if (isRequested) onUnavailable.current?.()
      return
    }

    const currentMap = mapRef.current
    if (currentMap === null) return
    const map = asTerrainMap(currentMap)
    if (map === null) {
      setErrorMessage('This map renderer does not support terrain.')
      onUnavailable.current?.()
      return
    }

    let isCurrent = true
    let hasFailed = false
    const safelyDisable = (): void => {
      if (mapRef.current !== currentMap) return
      const isClean = disableTerrain(map, ownership.current)
      if (isCurrent) {
        setIsEnabled(ownership.current.terrain)
        if (!isClean) {
          setErrorMessage(
            'Terrain changed, but some map resources could not be released.',
          )
        }
      }
    }
    const fail = (message: string): void => {
      if (hasFailed || !isCurrent || mapRef.current !== currentMap) return
      hasFailed = true
      safelyDisable()
      setErrorMessage(message)
      onUnavailable.current?.()
    }
    const enable = (): void => {
      if (
        !isCurrent ||
        !isRequested ||
        mapRef.current !== currentMap ||
        !currentMap.isStyleLoaded() ||
        !capability.source
      ) {
        return
      }
      if (ownership.current.terrain) {
        setIsEnabled(true)
        return
      }
      try {
        enableTerrain(
          map,
          capability.source,
          exaggeration,
          ownership.current,
          EXCAVATION_AREA_FILL_LAYER_ID,
          isHillshadeVisible,
        )
        setIsEnabled(true)
      } catch (error) {
        fail(error instanceof Error ? error.message : 'Terrain setup failed.')
      }
    }
    const handleError = (event?: unknown): void => {
      if (isTerrainError(event)) fail('Elevation tiles could not be loaded.')
    }
    const handleStyleLoad = (): void => {
      if (!isCurrent || mapRef.current !== currentMap) return
      releaseTerrainOwnership(ownership.current)
      setIsEnabled(false)
      setErrorMessage(null)
      if (isRequested) enable()
    }

    currentMap.on('style.load', handleStyleLoad)
    currentMap.on('error', handleError)
    if (isRequested) {
      setErrorMessage(null)
      if (currentMap.isStyleLoaded()) enable()
      else currentMap.on('load', enable)
    } else {
      safelyDisable()
    }

    return () => {
      isCurrent = false
      currentMap.off('load', enable)
      currentMap.off('style.load', handleStyleLoad)
      currentMap.off('error', handleError)
      safelyDisable()
    }
  }, [
    capability.isSupported,
    capability.source,
    exaggeration,
    isHillshadeVisible,
    isRequested,
    mapRef,
  ])

  const status: TerrainRuntimeStatus = !capability.isSupported
    ? 'unavailable'
    : errorMessage !== null
      ? 'error'
      : isEnabled
        ? 'enabled'
        : isRequested
          ? 'loading'
          : 'off'

  return { ...capability, exaggeration, isEnabled, status, errorMessage }
}
