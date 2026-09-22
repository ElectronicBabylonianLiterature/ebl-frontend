import type { Map as MapLibreMap } from 'maplibre-gl'

export const INITIAL_CENTER: [number, number] = [44.4, 33.0]
export const INITIAL_ZOOM = 5

export function resetMapCamera(map: MapLibreMap | null): void {
  map?.easeTo({ center: INITIAL_CENTER, zoom: INITIAL_ZOOM })
}
