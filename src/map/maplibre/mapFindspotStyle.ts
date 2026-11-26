import type { Map as MapLibreMap } from 'maplibre-gl'
import type { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import type { MapCameraOwnership } from 'map/maplibre/useMapCameraOwnership'
import { initializeFindspotSource } from 'map/maplibre/mapFindspotSource'
import { installFallbackMapBackground } from 'map/maplibre/mapBackgroundError'

interface FindspotStyleOptions {
  readonly camera: MapCameraOwnership
  readonly provenances: () => readonly ProvenanceRecord[] | null
  readonly isInitialCamera: () => boolean
  readonly onBackgroundErrorChange?: (hasError: boolean) => void
}

export function createFindspotStyleHandlers(
  map: MapLibreMap,
  {
    camera,
    provenances,
    isInitialCamera,
    onBackgroundErrorChange,
  }: FindspotStyleOptions,
): {
  readonly onStyleLoad: () => void
  readonly onBackgroundErrorChange: (hasError: boolean) => void
} {
  let hasFallbackBackground = false
  return {
    onStyleLoad: () => {
      onBackgroundErrorChange?.(
        hasFallbackBackground &&
          map.getStyle()?.metadata?.['ebl:fallback'] === true,
      )
      const loadedProvenances = provenances()
      if (loadedProvenances) {
        initializeFindspotSource(
          map,
          loadedProvenances,
          camera.shouldFitData() || isInitialCamera(),
        )
      }
    },
    onBackgroundErrorChange: (hasError) => {
      onBackgroundErrorChange?.(hasError)
      if (hasError && !hasFallbackBackground && !map.getStyle()) {
        hasFallbackBackground = true
        installFallbackMapBackground(map)
      }
    },
  }
}
