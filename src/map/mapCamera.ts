import type { Feature } from 'geojson'
import type { FitBoundsOptions, Map as MapLibreMap } from 'maplibre-gl'
import {
  ProvenanceRecord,
  getRenderableProvenanceGeometry as getProvenanceShape,
} from 'fragmentarium/domain/Provenance'
import {
  type BoundingBox,
  boundingBoxOfFeatures,
  boundingBoxOfGeometry,
  centroidOf,
  firstPosition,
} from './mapGeometry'

export const INITIAL_CENTER: [number, number] = [44.4, 33.0]
export const INITIAL_ZOOM = 5
export const SITE_FOCUS_ZOOM = 9

const DATA_FIT_OPTIONS: FitBoundsOptions = { padding: 40, maxZoom: 12 }
const FEATURE_FOCUS_OPTIONS: FitBoundsOptions = {
  padding: { top: 48, right: 48, bottom: 48, left: 360 },
  maxZoom: 16,
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

export function fitMapToData(
  map: MapLibreMap,
  features: readonly Feature[],
): void {
  fitMapToBoundingBox(map, boundingBoxOfFeatures(features), DATA_FIT_OPTIONS)
}

export function focusFeature(map: MapLibreMap, feature: Feature): void {
  if (feature.geometry.type === 'Point') {
    const position = firstPosition(feature.geometry)
    if (position) {
      map.easeTo({ center: [...position], zoom: SITE_FOCUS_ZOOM })
    }
    return
  }

  fitMapToBoundingBox(
    map,
    boundingBoxOfGeometry(feature.geometry),
    FEATURE_FOCUS_OPTIONS,
  )
}

export function focusProvenance(
  map: MapLibreMap | null,
  provenance: ProvenanceRecord | undefined,
): void {
  if (!map || !provenance) return

  const shape = getProvenanceShape(provenance)
  if (!shape) return

  const point =
    shape.type === 'point' ? shape.coordinates : centroidOf(shape.coordinates)
  if (!point) return

  map.easeTo({
    center: [point.longitude, point.latitude],
    zoom: SITE_FOCUS_ZOOM,
  })
}

export function resetCamera(map: MapLibreMap | null): void {
  map?.easeTo({ center: INITIAL_CENTER, zoom: INITIAL_ZOOM })
}
