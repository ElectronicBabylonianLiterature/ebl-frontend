import type { FeatureCollection } from 'geojson'
import type { HistoricalMapOverlay } from './historicalOverlays'
import {
  SOURCE_ID,
  POLYGON_SOURCE_ID,
  HISTORICAL_RASTER_SOURCE_ID,
  HISTORICAL_RASTER_LAYER_ID,
  CLUSTER_RADIUS,
  CLUSTER_MAX_ZOOM,
  createFindspotPolygonsSource,
  createFindspotsSource,
  createHistoricalRasterSource,
  createHistoricalRasterLayer,
  clusterLayer,
  clusterCountLayer,
  polygonFillLayer,
  polygonOutlineLayer,
  unclusteredLayer,
} from './mapLayers'

type LayerWithSource = { id: string; source: string; filter?: unknown[] }
type LayerWithPaint = LayerWithSource & { paint: Record<string, unknown> }
type LayerWithLayout = LayerWithSource & { layout: Record<string, unknown> }
type RasterLayerLike = {
  id: string
  type: string
  source: string
  paint?: Record<string, unknown>
}

describe('mapLayers', () => {
  describe('createFindspotsSource', () => {
    it('creates a clustered GeoJSON source with the given data', () => {
      const data: FeatureCollection = {
        type: 'FeatureCollection',
        features: [],
      }
      const source = createFindspotsSource(data)

      expect(source.type).toBe('geojson')
      expect(source.data).toBe(data)
      expect(source.cluster).toBe(true)
      expect(source.clusterRadius).toBe(CLUSTER_RADIUS)
      expect(source.clusterMaxZoom).toBe(CLUSTER_MAX_ZOOM)
    })
  })

  describe('createFindspotPolygonsSource', () => {
    it('creates a non-clustered GeoJSON source with the given data', () => {
      const data: FeatureCollection = {
        type: 'FeatureCollection',
        features: [],
      }
      const source = createFindspotPolygonsSource(data)

      expect(source.type).toBe('geojson')
      expect(source.data).toBe(data)
      expect(source.cluster).toBeUndefined()
    })
  })

  describe('polygonFillLayer', () => {
    it('references the polygon source and is visible by default', () => {
      const layer = polygonFillLayer as LayerWithLayout

      expect(layer.id).toBe('ebl-findspot-polygon-fill')
      expect(layer.source).toBe(POLYGON_SOURCE_ID)
      expect(layer.layout.visibility).toBe('visible')
    })
  })

  describe('polygonOutlineLayer', () => {
    it('references the polygon source and is visible by default', () => {
      const layer = polygonOutlineLayer as LayerWithLayout

      expect(layer.id).toBe('ebl-findspot-polygon-outline')
      expect(layer.source).toBe(POLYGON_SOURCE_ID)
      expect(layer.layout.visibility).toBe('visible')
    })
  })

  describe('clusterLayer', () => {
    it('is a circle layer filtered to features with point_count', () => {
      const layer = clusterLayer as LayerWithSource
      expect(layer.id).toBe('ebl-clusters')
      expect(layer.source).toBe(SOURCE_ID)
      expect(layer.filter).toEqual(['has', 'point_count'])
    })

    it('has paint properties for circle color, radius, and stroke', () => {
      const layer = clusterLayer as LayerWithPaint
      expect(layer.paint).toBeDefined()
      expect(layer.paint['circle-color']).toBeDefined()
      expect(layer.paint['circle-radius']).toBeDefined()
      expect(layer.paint['circle-stroke-width']).toBe(2)
      expect(layer.paint['circle-stroke-color']).toBe('#ffffff')
    })
  })

  describe('clusterCountLayer', () => {
    it('is a symbol layer filtered to features with point_count', () => {
      const layer = clusterCountLayer as LayerWithSource
      expect(layer.id).toBe('ebl-cluster-count')
      expect(layer.source).toBe(SOURCE_ID)
      expect(layer.filter).toEqual(['has', 'point_count'])
    })

    it('renders point_count_abbreviated as text', () => {
      const layer = clusterCountLayer as LayerWithLayout
      expect(layer.layout).toBeDefined()
      expect(layer.layout['text-field']).toBe('{point_count_abbreviated}')
    })
  })

  describe('unclusteredLayer', () => {
    it('is a circle layer filtered to features without point_count', () => {
      const layer = unclusteredLayer as LayerWithSource
      expect(layer.id).toBe('ebl-unclustered-points')
      expect(layer.source).toBe(SOURCE_ID)
      expect(layer.filter).toEqual(['!', ['has', 'point_count']])
    })

    it('has paint properties for marker appearance', () => {
      const layer = unclusteredLayer as LayerWithPaint
      expect(layer.paint).toBeDefined()
      expect(layer.paint['circle-color']).toBe('#0077be')
      expect(layer.paint['circle-radius']).toBe(8)
      expect(layer.paint['circle-stroke-width']).toBe(2)
      expect(layer.paint['circle-stroke-color']).toBe('#ffffff')
    })
  })

  describe('constants', () => {
    it('defines unique source IDs', () => {
      expect(SOURCE_ID).toBe('ebl-findspots')
      expect(POLYGON_SOURCE_ID).toBe('ebl-findspot-polygons')
    })

    it('defines sensible clustering defaults', () => {
      expect(CLUSTER_RADIUS).toBe(50)
      expect(CLUSTER_MAX_ZOOM).toBe(14)
    })

    it('keeps polygon layer ids stable and distinct', () => {
      expect(polygonFillLayer.id).toBe('ebl-findspot-polygon-fill')
      expect(polygonOutlineLayer.id).toBe('ebl-findspot-polygon-outline')
      expect(polygonFillLayer.id).not.toBe(polygonOutlineLayer.id)
    })

    it('defines stable historical raster source ID', () => {
      expect(HISTORICAL_RASTER_SOURCE_ID).toBe('ebl-historical-raster')
      expect(HISTORICAL_RASTER_SOURCE_ID).not.toBe(SOURCE_ID)
      expect(HISTORICAL_RASTER_SOURCE_ID).not.toBe(POLYGON_SOURCE_ID)
    })

    it('defines stable historical raster layer ID', () => {
      expect(HISTORICAL_RASTER_LAYER_ID).toBe('ebl-historical-raster-layer')
      expect(HISTORICAL_RASTER_LAYER_ID).not.toBe(polygonFillLayer.id)
    })
  })

  describe('createHistoricalRasterSource', () => {
    function makeOverlay(
      overrides: Partial<HistoricalMapOverlay> = {},
    ): HistoricalMapOverlay {
      return {
        id: 'test-map',
        title: 'Test Map',
        attribution: 'Test Attribution',
        type: 'raster-tiles',
        tiles: ['https://example.com/{z}/{x}/{y}.png'],
        defaultOpacity: 0.8,
        ...overrides,
      }
    }

    it('creates a raster source with tiles and attribution', () => {
      const source = createHistoricalRasterSource(makeOverlay())

      expect(source.type).toBe('raster')
      expect(source.tiles).toEqual(['https://example.com/{z}/{x}/{y}.png'])
      expect(source.attribution).toBe('Test Attribution')
    })

    it('does not spread an undefined tileSize into the source', () => {
      const source = createHistoricalRasterSource(makeOverlay())

      expect(source).not.toHaveProperty('tileSize')
    })

    it('includes tileSize when overlay defines it', () => {
      const source = createHistoricalRasterSource(
        makeOverlay({ tileSize: 256 }),
      )

      expect(source.tileSize).toBe(256)
    })

    it('includes bounds when overlay defines them', () => {
      const bounds: [number, number, number, number] = [44, 32, 45, 33]
      const source = createHistoricalRasterSource(makeOverlay({ bounds }))

      expect(source.bounds).toEqual([44, 32, 45, 33])
    })

    it('omits bounds when overlay does not define them', () => {
      const overlay = makeOverlay()
      delete (overlay as { bounds?: unknown }).bounds
      const source = createHistoricalRasterSource(overlay)

      expect(source).not.toHaveProperty('bounds')
    })

    it('includes minzoom when overlay defines it', () => {
      const source = createHistoricalRasterSource(makeOverlay({ minZoom: 5 }))

      expect(source.minzoom).toBe(5)
    })

    it('omits minzoom when overlay does not define it', () => {
      const source = createHistoricalRasterSource(makeOverlay())

      expect(source).not.toHaveProperty('minzoom')
    })

    it('includes maxzoom when overlay defines it', () => {
      const source = createHistoricalRasterSource(makeOverlay({ maxZoom: 15 }))

      expect(source.maxzoom).toBe(15)
    })

    it('omits maxzoom when overlay does not define it', () => {
      const source = createHistoricalRasterSource(makeOverlay())

      expect(source).not.toHaveProperty('maxzoom')
    })

    it('copies tiles array defensively', () => {
      const tiles = ['https://example.com/{z}/{x}/{y}.png']
      const source = createHistoricalRasterSource(makeOverlay({ tiles }))

      expect(source.tiles).not.toBe(tiles)
      expect(source.tiles).toEqual(tiles)
    })

    it('copies bounds array defensively', () => {
      const bounds: [number, number, number, number] = [44, 32, 45, 33]
      const source = createHistoricalRasterSource(makeOverlay({ bounds }))

      expect(source.bounds).not.toBe(bounds)
      expect(source.bounds).toEqual(bounds)
    })
  })

  describe('createHistoricalRasterLayer', () => {
    it('references the historical raster source', () => {
      const layer = createHistoricalRasterLayer(0.8) as RasterLayerLike

      expect(layer.id).toBe(HISTORICAL_RASTER_LAYER_ID)
      expect(layer.type).toBe('raster')
      expect(layer.source).toBe(HISTORICAL_RASTER_SOURCE_ID)
    })

    it('sets raster-opacity paint property', () => {
      const layer = createHistoricalRasterLayer(0.5) as RasterLayerLike

      expect(layer.paint).toBeDefined()
      expect(layer.paint?.['raster-opacity']).toBe(0.5)
    })

    it('accepts full opacity', () => {
      const layer = createHistoricalRasterLayer(1) as RasterLayerLike

      expect(layer.paint?.['raster-opacity']).toBe(1)
    })

    it('accepts zero opacity', () => {
      const layer = createHistoricalRasterLayer(0) as RasterLayerLike

      expect(layer.paint?.['raster-opacity']).toBe(0)
    })
  })
})
