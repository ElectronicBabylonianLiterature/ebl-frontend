import type { Feature } from 'geojson'
import type { FitBoundsOptions, Map as MapLibreMap } from 'maplibre-gl'
import { runMapFocus } from 'map/mapFocusTransition'
import {
  ProvenanceRecord,
  getRenderableProvenanceGeometry as getProvenanceShape,
} from 'fragmentarium/domain/Provenance'
import {
  type BoundingBox,
  boundingBoxOfFeatures,
  boundingBoxOfGeometry,
  boundingBoxOfPositions,
  firstPosition,
} from 'map/mapGeometry'

export const INITIAL_CENTER: [number, number] = [44.4, 33.0]
export const INITIAL_ZOOM = 5
export const SITE_FOCUS_ZOOM = 14

// Automatic data framing must finish before delayed layout measurements update padding.
const DATA_FIT_OPTIONS: FitBoundsOptions = {
  padding: 40,
  maxZoom: 12,
  animate: false,
}
// MapLibre adds this margin to the measured drawer or bottom-sheet padding.
const FEATURE_FOCUS_OPTIONS: FitBoundsOptions = {
  padding: 48,
  maxZoom: 16,
}

export function fitMapToBoundingBox(
  map: MapLibreMap,
  bounds: BoundingBox | null,
  options: FitBoundsOptions,
  waitForPanel = false,
): void {
  if (!bounds) return

  runMapFocus(
    map,
    () =>
      map.fitBounds(
        [
          [bounds[0], bounds[1]],
          [bounds[2], bounds[3]],
        ],
        options,
      ),
    waitForPanel,
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
      runMapFocus(
        map,
        () =>
          map.easeTo({
            center: [...position],
            zoom: Math.max(map.getZoom(), SITE_FOCUS_ZOOM),
          }),
        true,
      )
    }
    return
  }

  fitMapToBoundingBox(
    map,
    boundingBoxOfGeometry(feature.geometry),
    FEATURE_FOCUS_OPTIONS,
    true,
  )
}

export function focusProvenance(
  map: MapLibreMap | null,
  provenance: ProvenanceRecord | undefined,
): void {
  if (!map || !provenance) return

  const shape = getProvenanceShape(provenance)
  if (!shape) return

  if (shape.type === 'polygon') {
    fitMapToBoundingBox(
      map,
      boundingBoxOfPositions(
        shape.coordinates.map(({ longitude, latitude }) => [
          longitude,
          latitude,
        ]),
      ),
      FEATURE_FOCUS_OPTIONS,
      true,
    )
    return
  }

  runMapFocus(
    map,
    () =>
      map.easeTo({
        center: [shape.coordinates.longitude, shape.coordinates.latitude],
        zoom: Math.max(map.getZoom(), SITE_FOCUS_ZOOM),
      }),
    true,
  )
}

export function resetCamera(map: MapLibreMap | null): void {
  map?.easeTo({
    center: INITIAL_CENTER,
    zoom: INITIAL_ZOOM,
    pitch: 0,
    bearing: 0,
  })
}
