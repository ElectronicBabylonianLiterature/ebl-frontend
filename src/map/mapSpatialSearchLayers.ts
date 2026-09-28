import type { FeatureCollection, Position } from 'geojson'
import type {
  AddLayerObject,
  GeoJSONSource,
  GeoJSONSourceSpecification,
  Map as MapLibreMap,
} from 'maplibre-gl'
import type { BoundingBox } from 'map/mapGeometry'
import { geometryOfBounds } from 'map/spatialBounds'

export const SPATIAL_SEARCH_SOURCE_ID = 'ebl-spatial-search'
export const SPATIAL_SEARCH_FILL_LAYER_ID = 'ebl-spatial-search-fill'
export const SPATIAL_SEARCH_OUTLINE_LAYER_ID = 'ebl-spatial-search-outline'
export const SPATIAL_SEARCH_POINT_LAYER_ID = 'ebl-spatial-search-point'

const emptyCollection = (): FeatureCollection => ({
  type: 'FeatureCollection',
  features: [],
})

const source = (): GeoJSONSourceSpecification => ({
  type: 'geojson',
  data: emptyCollection(),
})

const fillLayer: AddLayerObject = {
  id: SPATIAL_SEARCH_FILL_LAYER_ID,
  type: 'fill',
  source: SPATIAL_SEARCH_SOURCE_ID,
  filter: ['in', ['geometry-type'], ['literal', ['Polygon', 'MultiPolygon']]],
  paint: {
    'fill-color': '#d63384',
    'fill-opacity': 0.12,
  },
}

const outlineLayer: AddLayerObject = {
  id: SPATIAL_SEARCH_OUTLINE_LAYER_ID,
  type: 'line',
  source: SPATIAL_SEARCH_SOURCE_ID,
  filter: ['in', ['geometry-type'], ['literal', ['Polygon', 'MultiPolygon']]],
  paint: {
    'line-color': '#d63384',
    'line-width': 2,
    'line-dasharray': [2, 1],
  },
}

const pointLayer: AddLayerObject = {
  id: SPATIAL_SEARCH_POINT_LAYER_ID,
  type: 'circle',
  source: SPATIAL_SEARCH_SOURCE_ID,
  filter: ['==', ['geometry-type'], 'Point'],
  paint: {
    'circle-radius': 5,
    'circle-color': '#d63384',
    'circle-stroke-color': '#ffffff',
    'circle-stroke-width': 1,
  },
}

const layers = [fillLayer, outlineLayer, pointLayer] as const

export function addSpatialSearchLayers(map: MapLibreMap): void {
  if (!map.getSource(SPATIAL_SEARCH_SOURCE_ID)) {
    map.addSource(SPATIAL_SEARCH_SOURCE_ID, source())
  }
  layers.forEach((layer) => {
    if (!map.getLayer(layer.id)) map.addLayer(layer)
  })
}

export function removeSpatialSearchLayers(map: MapLibreMap): void {
  ;[...layers].reverse().forEach(({ id }) => {
    if (map.getLayer(id)) map.removeLayer(id)
  })
  if (map.getSource(SPATIAL_SEARCH_SOURCE_ID)) {
    map.removeSource(SPATIAL_SEARCH_SOURCE_ID)
  }
}

function validBounds(bounds: BoundingBox): boolean {
  return (
    bounds.every(Number.isFinite) &&
    bounds[0] < bounds[2] &&
    bounds[1] < bounds[3]
  )
}

export function spatialSearchCollection(
  firstCorner: Position | null,
  bounds: readonly BoundingBox[],
): FeatureCollection {
  const geometry = geometryOfBounds(bounds.filter(validBounds))
  const features: FeatureCollection['features'] = []

  if (
    firstCorner &&
    Number.isFinite(firstCorner[0]) &&
    Number.isFinite(firstCorner[1])
  ) {
    features.push({
      type: 'Feature',
      properties: {},
      geometry: { type: 'Point', coordinates: [...firstCorner] },
    })
  }

  if (geometry) {
    features.push({
      type: 'Feature',
      properties: {},
      geometry,
    })
  }

  return { type: 'FeatureCollection', features }
}

export function updateSpatialSearchGeometry(
  map: MapLibreMap,
  firstCorner: Position | null,
  bounds: readonly BoundingBox[],
): void {
  const spatialSource = map.getSource(SPATIAL_SEARCH_SOURCE_ID) as
    | GeoJSONSource
    | undefined
  spatialSource?.setData(spatialSearchCollection(firstCorner, bounds))
}

export interface SpatialSearchLayerLifecycle {
  readonly update: (
    firstCorner: Position | null,
    bounds: readonly BoundingBox[],
  ) => void
  readonly dispose: () => void
}

export function createSpatialSearchLayerLifecycle(
  map: MapLibreMap,
  isCurrentMap: () => boolean = () => true,
): SpatialSearchLayerLifecycle {
  let latestCorner: Position | null = null
  let latestBounds: readonly BoundingBox[] = []
  let disposed = false

  const install = (): void => {
    if (disposed || !isCurrentMap()) return
    addSpatialSearchLayers(map)
    updateSpatialSearchGeometry(map, latestCorner, latestBounds)
  }

  if (map.isStyleLoaded()) install()
  else map.once('load', install)

  return {
    update(firstCorner, bounds): void {
      latestCorner = firstCorner
      latestBounds = bounds
      if (!disposed && isCurrentMap() && map.isStyleLoaded()) install()
    },
    dispose(): void {
      disposed = true
      if (!isCurrentMap()) return
      map.off('load', install)
      removeSpatialSearchLayers(map)
    },
  }
}
