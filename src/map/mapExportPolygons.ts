import type { MutableRefObject } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import {
  EXCAVATION_AREA_FILL_LAYER_ID,
  EXCAVATION_EXTRUSION_LAYER_ID,
} from 'map/mapLayerIds'

function renderedPolygonIds(map: MapLibreMap): readonly string[] {
  if (!map.isStyleLoaded()) return []
  const layers = [
    EXCAVATION_AREA_FILL_LAYER_ID,
    EXCAVATION_EXTRUSION_LAYER_ID,
  ].filter((layer) => Boolean(map.getLayer(layer)))
  const ids =
    layers.length === 0
      ? []
      : map
          .queryRenderedFeatures(undefined, { layers })
          .map(({ id }) => id)
          .filter((id): id is string => typeof id === 'string')
  return [...new Set(ids)].sort()
}

export function subscribeExportPolygons(
  mapRef: MutableRefObject<MapLibreMap | null>,
  map: MapLibreMap,
  onChange: (ids: readonly string[]) => void,
): () => void {
  let isDisposed = false
  const update = (): void => {
    if (isDisposed || mapRef.current !== map) return
    onChange(renderedPolygonIds(map))
  }
  map.on('moveend', update)
  map.on('idle', update)
  map.on('load', update)
  if (map.isStyleLoaded()) update()
  return () => {
    isDisposed = true
    map.off('moveend', update)
    map.off('idle', update)
    map.off('load', update)
  }
}
