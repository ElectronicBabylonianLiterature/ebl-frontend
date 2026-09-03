import type { FeatureCollection, Position } from 'geojson'
import type {
  AddLayerObject,
  GeoJSONSource,
  GeoJSONSourceSpecification,
  Map as MapLibreMap,
} from 'maplibre-gl'

export const MEASUREMENT_SOURCE_ID = 'ebl-measurement'
export const MEASUREMENT_LINE_LAYER_ID = 'ebl-measurement-line'
export const MEASUREMENT_POINT_LAYER_ID = 'ebl-measurement-point'

function emptyCollection(): FeatureCollection {
  return { type: 'FeatureCollection', features: [] }
}

function measurementSource(): GeoJSONSourceSpecification {
  return { type: 'geojson', data: emptyCollection() }
}

const lineLayer: AddLayerObject = {
  id: MEASUREMENT_LINE_LAYER_ID,
  type: 'line',
  source: MEASUREMENT_SOURCE_ID,
  filter: ['==', ['geometry-type'], 'LineString'],
  paint: {
    'line-color': '#d63384',
    'line-width': 2,
    'line-dasharray': [2, 1],
  },
}

const pointLayer: AddLayerObject = {
  id: MEASUREMENT_POINT_LAYER_ID,
  type: 'circle',
  source: MEASUREMENT_SOURCE_ID,
  filter: ['==', ['geometry-type'], 'Point'],
  paint: {
    'circle-radius': 4,
    'circle-color': '#d63384',
    'circle-stroke-color': '#ffffff',
    'circle-stroke-width': 1,
  },
}

export function addMeasurementLayers(map: MapLibreMap): void {
  if (map.getSource(MEASUREMENT_SOURCE_ID)) return
  map.addSource(MEASUREMENT_SOURCE_ID, measurementSource())
  map.addLayer(lineLayer)
  map.addLayer(pointLayer)
}

export function removeMeasurementLayers(map: MapLibreMap): void {
  ;[MEASUREMENT_LINE_LAYER_ID, MEASUREMENT_POINT_LAYER_ID].forEach((id) => {
    if (map.getLayer(id)) map.removeLayer(id)
  })
  if (map.getSource(MEASUREMENT_SOURCE_ID)) {
    map.removeSource(MEASUREMENT_SOURCE_ID)
  }
}

export function measurementCollection(
  positions: readonly Position[],
): FeatureCollection {
  const points = positions.map((position) => ({
    type: 'Feature' as const,
    properties: {},
    geometry: { type: 'Point' as const, coordinates: [...position] },
  }))

  if (positions.length < 2) {
    return { type: 'FeatureCollection', features: points }
  }

  return {
    type: 'FeatureCollection',
    features: [
      ...points,
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: positions.map((position) => [...position]),
        },
      },
    ],
  }
}

export function updateMeasurementGeometry(
  map: MapLibreMap,
  positions: readonly Position[],
): void {
  const source = map.getSource(MEASUREMENT_SOURCE_ID) as GeoJSONSource | undefined
  source?.setData(measurementCollection(positions))
}
