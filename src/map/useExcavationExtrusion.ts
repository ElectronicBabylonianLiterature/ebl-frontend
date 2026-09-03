import { useEffect } from 'react'
import type { MutableRefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { EXCAVATION_AREAS_SOURCE_ID } from 'map/mapLayerIds'
import {
  EXCAVATION_EXTRUSION_LAYER_ID,
  applyExtrusionPaint,
  createExcavationExtrusionLayer,
  pitchForExtrusion,
  setExtrusionVisibility,
} from 'map/mapExtrusionLayers'
import type { ExcavationPaint } from 'map/mapExcavationPaint'
import type { ExtrusionScale } from 'map/mapExtrusionScale'
import prefersReducedMotion from 'common/utils/prefersReducedMotion'

export interface ExcavationExtrusionOptions {
  readonly isEnabled: boolean
  readonly paint: ExcavationPaint
  readonly scale: ExtrusionScale | null
}

export default function useExcavationExtrusion(
  mapRef: MutableRefObject<MapLibreMap | null>,
  { isEnabled, paint, scale }: ExcavationExtrusionOptions,
): void {
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const install = (): void => {
      if (!map.getSource(EXCAVATION_AREAS_SOURCE_ID)) return
      if (!map.getLayer(EXCAVATION_EXTRUSION_LAYER_ID)) {
        map.addLayer(createExcavationExtrusionLayer(paint, scale, isEnabled))
      }
      applyExtrusionPaint(map, paint, scale)
      setExtrusionVisibility(map, isEnabled)
      if (isEnabled) pitchForExtrusion(map, prefersReducedMotion())
    }

    if (map.isStyleLoaded()) install()
    else map.once('load', install)

    return () => {
      map.off('load', install)
      if (map.getLayer(EXCAVATION_EXTRUSION_LAYER_ID)) {
        map.removeLayer(EXCAVATION_EXTRUSION_LAYER_ID)
      }
    }
  }, [mapRef, isEnabled, paint, scale])
}
