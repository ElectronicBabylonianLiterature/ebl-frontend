import type { Map as MapLibreMap } from 'maplibre-gl'
import {
  SPATIAL_SEARCH_FILL_LAYER_ID,
  SPATIAL_SEARCH_OUTLINE_LAYER_ID,
  SPATIAL_SEARCH_POINT_LAYER_ID,
  SPATIAL_SEARCH_SOURCE_ID,
  addSpatialSearchLayers,
  createSpatialSearchLayerLifecycle,
  removeSpatialSearchLayers,
  spatialSearchCollection,
} from 'map/mapSpatialSearchLayers'

function createMap(isStyleLoaded = true) {
  const layerIds = new Set<string>()
  const source = { setData: jest.fn() }
  let hasSource = false
  let loadHandler: (() => void) | undefined
  let styleLoaded = isStyleLoaded

  const methods = {
    addSource: jest.fn(() => {
      hasSource = true
    }),
    getSource: jest.fn(() => (hasSource ? source : undefined)),
    removeSource: jest.fn(() => {
      hasSource = false
    }),
    addLayer: jest.fn((layer: { id: string }) => layerIds.add(layer.id)),
    getLayer: jest.fn((id: string) => (layerIds.has(id) ? { id } : undefined)),
    removeLayer: jest.fn((id: string) => layerIds.delete(id)),
    isStyleLoaded: jest.fn(() => styleLoaded),
    once: jest.fn((_event: string, handler: () => void) => {
      loadHandler = handler
    }),
    off: jest.fn(),
  }

  return {
    map: methods as unknown as MapLibreMap,
    methods,
    source,
    load: () => loadHandler?.(),
    finishStyleLoad: () => {
      styleLoaded = true
    },
  }
}

describe('spatialSearchCollection', () => {
  it('shows the first corner before the rectangle is complete', () => {
    const collection = spatialSearchCollection([43, 35], [])

    expect(collection.features).toEqual([
      {
        type: 'Feature',
        properties: {},
        geometry: { type: 'Point', coordinates: [43, 35] },
      },
    ])
  })

  it('renders one bound as a closed polygon', () => {
    const collection = spatialSearchCollection(null, [[43, 35, 44, 36]])

    expect(collection.features[0].geometry).toEqual({
      type: 'Polygon',
      coordinates: [
        [
          [43, 35],
          [44, 35],
          [44, 36],
          [43, 36],
          [43, 35],
        ],
      ],
    })
  })

  it('renders split antimeridian bounds as a multi-polygon', () => {
    const collection = spatialSearchCollection(null, [
      [179, -1, 180, 1],
      [-180, -1, -179, 1],
    ])

    expect(collection.features[0].geometry.type).toBe('MultiPolygon')
    expect(collection.features[0].geometry).toMatchObject({
      coordinates: [
        [
          [
            [179, -1],
            [180, -1],
            [180, 1],
            [179, 1],
            [179, -1],
          ],
        ],
        [
          [
            [-180, -1],
            [-179, -1],
            [-179, 1],
            [-180, 1],
            [-180, -1],
          ],
        ],
      ],
    })
  })

  it('omits non-finite and zero-area geometry', () => {
    const collection = spatialSearchCollection(
      [Number.NaN, 35],
      [
        [43, 35, 43, 36],
        [43, 35, Number.POSITIVE_INFINITY, 36],
      ],
    )

    expect(collection.features).toEqual([])
  })
})

describe('spatial-search layers', () => {
  it('installs every missing layer independently and only one source', () => {
    const { map, methods } = createMap()

    addSpatialSearchLayers(map)
    addSpatialSearchLayers(map)

    expect(methods.addSource).toHaveBeenCalledTimes(1)
    expect(methods.addLayer.mock.calls.map(([layer]) => layer.id)).toEqual([
      SPATIAL_SEARCH_FILL_LAYER_ID,
      SPATIAL_SEARCH_OUTLINE_LAYER_ID,
      SPATIAL_SEARCH_POINT_LAYER_ID,
    ])
  })

  it('removes layers in reverse order before removing the source', () => {
    const { map, methods } = createMap()
    addSpatialSearchLayers(map)

    removeSpatialSearchLayers(map)

    expect(methods.removeLayer.mock.calls.map(([id]) => id)).toEqual([
      SPATIAL_SEARCH_POINT_LAYER_ID,
      SPATIAL_SEARCH_OUTLINE_LAYER_ID,
      SPATIAL_SEARCH_FILL_LAYER_ID,
    ])
    expect(methods.removeSource).toHaveBeenCalledWith(SPATIAL_SEARCH_SOURCE_ID)
  })
})

describe('createSpatialSearchLayerLifecycle', () => {
  it('replays the latest geometry when a delayed style finishes loading', () => {
    const { map, methods, source, finishStyleLoad, load } = createMap(false)
    const lifecycle = createSpatialSearchLayerLifecycle(map)
    lifecycle.update([43, 35], [[43, 35, 44, 36]])

    expect(methods.addSource).not.toHaveBeenCalled()
    finishStyleLoad()
    load()

    expect(methods.addSource).toHaveBeenCalledTimes(1)
    expect(source.setData).toHaveBeenCalledTimes(1)
    expect(source.setData.mock.calls[0][0].features).toHaveLength(2)
  })

  it('removes installed data and detaches the delayed-load handler', () => {
    const { map, methods } = createMap()
    const lifecycle = createSpatialSearchLayerLifecycle(map)

    lifecycle.dispose()

    expect(methods.off).toHaveBeenCalledWith('load', expect.any(Function))
    expect(methods.removeSource).toHaveBeenCalledWith(SPATIAL_SEARCH_SOURCE_ID)
  })

  it('does not touch a disposed map after ownership changes', () => {
    const { map, methods } = createMap()
    let isCurrent = true
    const lifecycle = createSpatialSearchLayerLifecycle(map, () => isCurrent)
    jest.clearAllMocks()
    isCurrent = false

    lifecycle.update([43, 35], [])
    lifecycle.dispose()

    expect(methods.isStyleLoaded).not.toHaveBeenCalled()
    expect(methods.off).not.toHaveBeenCalled()
    expect(methods.getLayer).not.toHaveBeenCalled()
    expect(methods.getSource).not.toHaveBeenCalled()
  })
})
