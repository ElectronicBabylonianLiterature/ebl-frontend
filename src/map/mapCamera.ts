import type { FitBoundsOptions, Map as MapLibreMap } from 'maplibre-gl'
import type { BoundingBox } from 'map/mapGeometry'

export const INITIAL_CENTER: [number, number] = [44.4, 33.0]
export const INITIAL_ZOOM = 5

export function resetMapCamera(map: MapLibreMap | null): void {
  map?.easeTo({ center: INITIAL_CENTER, zoom: INITIAL_ZOOM, pitch: 0, bearing: 0 })
}

export function fitMapToBoundingBox(
  map: MapLibreMap,
  bounds: BoundingBox | null,
  options: FitBoundsOptions,
): void {
  if (!bounds) return
  map.fitBounds(
    [
      [bounds[0], bounds[1]],
      [bounds[2], bounds[3]],
    ],
    options,
  )
}
