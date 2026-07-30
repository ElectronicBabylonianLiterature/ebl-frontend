import type { Feature, Point } from 'geojson'
import maplibregl from 'maplibre-gl'
import type { Map as MapLibreMap } from 'maplibre-gl'

const FIT_BOUNDS_PADDING = 40
const FIT_BOUNDS_MAX_ZOOM = 12

function getPointCoordinates(feature: Feature): [number, number] | null {
  if (feature.geometry.type !== 'Point') return null

  const coordinates = (feature.geometry as Point).coordinates
  const longitude = coordinates[0]
  const latitude = coordinates[1]

  return typeof longitude === 'number' &&
    Number.isFinite(longitude) &&
    typeof latitude === 'number' &&
    Number.isFinite(latitude)
    ? [longitude, latitude]
    : null
}

export function fitMapToData(
  map: MapLibreMap,
  features: readonly Feature[],
): void {
  const bounds = new maplibregl.LngLatBounds()

  features.forEach((feature) => {
    const coordinates = getPointCoordinates(feature)
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
