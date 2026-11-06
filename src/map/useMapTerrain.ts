import { useEffect, useMemo, useRef, useState } from 'react'
import type { MutableRefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { createTerrainOwnership } from 'map/mapTerrainLayers'
import MapTerrainLifecycle from 'map/mapTerrainLifecycle'
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

export interface MapTerrainOptions {
  readonly exaggeration?: number
  readonly isHillshadeVisible?: boolean
  readonly onUnavailable?: () => void
}

function terrainRuntimeStatus(
  isSupported: boolean,
  errorMessage: string | null,
  isEnabled: boolean,
  isRequested: boolean,
): TerrainRuntimeStatus {
  if (!isSupported) return 'unavailable'
  if (errorMessage !== null) return 'error'
  if (isEnabled) return 'enabled'
  return isRequested ? 'loading' : 'off'
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
    if (typeof currentMap.setTerrain !== 'function') {
      setErrorMessage('This map renderer does not support terrain.')
      onUnavailable.current?.()
      return
    }

    const lifecycle = new MapTerrainLifecycle(currentMap, {
      mapRef,
      ownership: ownership.current,
      source: capability.source,
      isRequested,
      exaggeration,
      isHillshadeVisible,
      onEnabledChange: setIsEnabled,
      onErrorChange: setErrorMessage,
      onUnavailable: () => onUnavailable.current?.(),
    })
    lifecycle.start()
    return () => lifecycle.dispose()
  }, [
    capability.isSupported,
    capability.source,
    exaggeration,
    isHillshadeVisible,
    isRequested,
    mapRef,
  ])

  const status = terrainRuntimeStatus(
    capability.isSupported,
    errorMessage,
    isEnabled,
    isRequested,
  )

  return { ...capability, exaggeration, isEnabled, status, errorMessage }
}
