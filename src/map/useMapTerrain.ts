import { useEffect, useMemo, useState } from 'react'
import type { MutableRefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { POLYGON_FILL_LAYER_ID } from './mapLayerIds'
import {
  type TerrainMapLike,
  disableTerrain,
  enableTerrain,
} from './mapTerrainLayers'
import {
  type TerrainCapability,
  deriveTerrainCapability,
} from './mapTerrainCapability'

export interface MapTerrainResult extends TerrainCapability {
  readonly isEnabled: boolean
}

function asTerrainMap(map: MapLibreMap | null): TerrainMapLike | null {
  return map !== null &&
    typeof (map as TerrainMapLike).setTerrain === 'function'
    ? (map as unknown as TerrainMapLike)
    : null
}

export interface MapTerrainOptions {
  readonly isReady?: boolean
  readonly exaggeration?: number
  readonly isHillshadeVisible?: boolean
}

export default function useMapTerrain(
  mapRef: MutableRefObject<MapLibreMap | null>,
  isRequested: boolean,
  options: MapTerrainOptions = {},
): MapTerrainResult {
  const capability = useMemo(() => deriveTerrainCapability(), [])
  const [isEnabled, setIsEnabled] = useState(false)
  const isReady = options.isReady ?? true
  const shouldEnable = isRequested && capability.isSupported
  const exaggeration = options.exaggeration ?? capability.exaggeration
  const isHillshadeVisible = options.isHillshadeVisible ?? true

  useEffect(() => {
    setIsEnabled(false)
    const currentMap = mapRef.current
    const map = asTerrainMap(currentMap)
    if (!isReady || !currentMap || !map || !shouldEnable) return

    let isActive = true
    let isApplied = false
    const ownsMap = (): boolean => mapRef.current === currentMap
    const isCurrent = (): boolean => isActive && ownsMap()
    const apply = (): void => {
      if (!currentMap.getStyle() || !capability.source) return
      enableTerrain(
        map,
        capability.source,
        exaggeration,
        POLYGON_FILL_LAYER_ID,
        isHillshadeVisible,
      )
      isApplied = true
      setIsEnabled(true)
    }
    const handleStyleLoad = (): void => {
      if (!isCurrent()) return
      isApplied = false
      setIsEnabled(false)
      apply()
    }

    currentMap.on('style.load', handleStyleLoad)
    apply()
    return () => {
      isActive = false
      currentMap.off('style.load', handleStyleLoad)
      if (ownsMap() && isApplied && currentMap.getStyle()) {
        disableTerrain(map)
      }
    }
  }, [
    mapRef,
    isReady,
    shouldEnable,
    capability.source,
    exaggeration,
    isHillshadeVisible,
  ])

  return { ...capability, exaggeration, isEnabled }
}
