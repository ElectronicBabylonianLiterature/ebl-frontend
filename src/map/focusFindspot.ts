import type { Map as MapLibreMap } from 'maplibre-gl'
import {
  type ProvenanceRecord,
  getRenderableProvenanceGeometry,
} from 'fragmentarium/domain/Provenance'
import { isValidPointCoordinate } from 'map/pointCoordinates'

const FINDSPOT_DETAIL_ZOOM = 14

export function focusFindspot(
  map: MapLibreMap,
  coordinates: [number, number],
  provenance?: ProvenanceRecord,
): void {
  const geometry = provenance && getRenderableProvenanceGeometry(provenance)
  const zoom = Math.max(map.getZoom(), FINDSPOT_DETAIL_ZOOM)
  if (geometry?.type === 'polygon') {
    const positions = geometry.coordinates.map(
      ({ longitude, latitude }): [number, number] => [longitude, latitude],
    )
    if (
      positions.every(([longitude, latitude]) =>
        isValidPointCoordinate(longitude, latitude),
      )
    ) {
      const longitudes = positions.map(([longitude]) => longitude)
      const latitudes = positions.map(([, latitude]) => latitude)
      map.fitBounds(
        [
          [Math.min(...longitudes), Math.min(...latitudes)],
          [Math.max(...longitudes), Math.max(...latitudes)],
        ],
        { padding: 40, maxZoom: zoom },
      )
      return
    }
  }
  map.easeTo({ center: coordinates, zoom })
}
