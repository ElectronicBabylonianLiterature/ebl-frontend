import type { Feature } from 'geojson'
import maplibregl from 'maplibre-gl'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { getFeaturePointCoordinates } from 'map/pointCoordinates'

const FIT_BOUNDS_PADDING = 40
const FIT_BOUNDS_MAX_ZOOM = 12

export function fitMapToData(
  map: MapLibreMap,
  features: readonly Feature[],
): void {
  const bounds = new maplibregl.LngLatBounds()

  features.forEach((feature) => {
    const coordinates = getFeaturePointCoordinates(feature)
    if (coordinates) {
      bounds.extend(coordinates)
    }
  })

  if (!bounds.isEmpty()) {
    map.fitBounds(bounds, {
      padding: FIT_BOUNDS_PADDING,
      maxZoom: FIT_BOUNDS_MAX_ZOOM,
    })
  }
}
