import { useEffect, useMemo } from 'react'
import type { MutableRefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { EXCAVATION_AREA_FILL_LAYER_ID } from 'map/mapLayerIds'
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
  readonly exaggeration?: number
  readonly isHillshadeVisible?: boolean
}

export default function useMapTerrain(
  mapRef: MutableRefObject<MapLibreMap | null>,
  isRequested: boolean,
  options: MapTerrainOptions = {},
): MapTerrainResult {
  const capability = useMemo(() => deriveTerrainCapability(), [])
  const isEnabled = isRequested && capability.isSupported
  const exaggeration = options.exaggeration ?? capability.exaggeration
  const isHillshadeVisible = options.isHillshadeVisible ?? true

  useEffect(() => {
    const currentMap = mapRef.current
    const map = asTerrainMap(currentMap)
    if (map === null || !currentMap?.isStyleLoaded()) return

    if (isEnabled && capability.source) {
      enableTerrain(
        map,
        capability.source,
        exaggeration,
        EXCAVATION_AREA_FILL_LAYER_ID,
        isHillshadeVisible,
      )
    } else {
      disableTerrain(map)
    }

    return () => {
      if (currentMap.isStyleLoaded()) {
        disableTerrain(map)
      }
    }
  }, [mapRef, isEnabled, capability.source, exaggeration, isHillshadeVisible])

  return { ...capability, exaggeration, isEnabled }
}
