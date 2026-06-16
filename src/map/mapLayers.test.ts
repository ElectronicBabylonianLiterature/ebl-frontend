import {
  SOURCE_ID,
  CLUSTER_RADIUS,
  CLUSTER_MAX_ZOOM,
  createFindspotsSource,
  clusterLayer,
  clusterCountLayer,
  unclusteredLayer,
} from './mapLayers'

type LayerWithSource = { id: string; source: string; filter: unknown[] }
type LayerWithPaint = LayerWithSource & { paint: Record<string, unknown> }
type LayerWithLayout = LayerWithSource & { layout: Record<string, unknown> }

describe('mapLayers', () => {
  describe('createFindspotsSource', () => {
    it('creates a clustered GeoJSON source with the given data', () => {
      const data: GeoJSON.FeatureCollection = {
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
    it('defines a unique source ID', () => {
      expect(SOURCE_ID).toBe('ebl-findspots')
    })

    it('defines sensible clustering defaults', () => {
      expect(CLUSTER_RADIUS).toBe(50)
      expect(CLUSTER_MAX_ZOOM).toBe(14)
    })
  })
})
