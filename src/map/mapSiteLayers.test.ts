import { evaluatePaint } from 'test-support/mapExpressionEvaluator'
import {
  clusterCountLayer,
  clusterLayer,
  createFindspotPolygonsSource,
  createFindspotsSource,
  polygonFillLayer,
  polygonOutlineLayer,
  unclusteredLayer,
  CLUSTER_COLOR,
  CLUSTER_RING_COLOR,
  SITE_COLOR_COORDINATES,
  SITE_COLOR_EXCAVATION,
  SITE_COLOR_FRAGMENT_DATA,
  SITE_COLOR_SELECTED,
} from './mapSiteLayers'
import { SITE_MARKER_CODES } from './mapSiteSummaries'
import {
  CLUSTER_MAX_ZOOM,
  CLUSTER_RADIUS,
  POLYGON_SOURCE_ID,
  SOURCE_ID,
} from './mapLayerIds'

const emptyCollection = { type: 'FeatureCollection' as const, features: [] }

function paintOf(layer: unknown): Record<string, unknown> {
  return (layer as { paint: Record<string, unknown> }).paint
}

function sourceOf(layer: unknown): string {
  return (layer as { source: string }).source
}

const CLUSTER_COUNT_PROPERTY = 'point_count'

function clusterProperties(count: number): Record<string, number> {
  return { [CLUSTER_COUNT_PROPERTY]: count }
}

describe('sources', () => {
  it('clusters the findspot point source', () => {
    expect(createFindspotsSource(emptyCollection)).toEqual({
      type: 'geojson',
      data: emptyCollection,
      cluster: true,
      clusterRadius: CLUSTER_RADIUS,
      clusterMaxZoom: CLUSTER_MAX_ZOOM,
    })
  })

  it('does not cluster the provenance polygon source', () => {
    expect(createFindspotPolygonsSource(emptyCollection)).toEqual({
      type: 'geojson',
      data: emptyCollection,
    })
  })
})

describe('provenance polygon layers', () => {
  it('fills and outlines from the polygon source', () => {
    expect(sourceOf(polygonFillLayer)).toBe(POLYGON_SOURCE_ID)
    expect(sourceOf(polygonOutlineLayer)).toBe(POLYGON_SOURCE_ID)
    expect(paintOf(polygonFillLayer)['fill-color']).toBe('#4b6b86')
    expect(paintOf(polygonOutlineLayer)['line-width']).toBe(1.6)
  })
})

describe('cluster layers', () => {
  it('is filtered to clustered features', () => {
    expect(sourceOf(clusterLayer)).toBe(SOURCE_ID)
    expect((clusterLayer as { filter: unknown }).filter).toEqual([
      'has',
      'point_count',
    ])
    expect((clusterCountLayer as { filter: unknown }).filter).toEqual([
      'has',
      'point_count',
    ])
  })

  it('grows the cluster radius in steps with the point count', () => {
    const radiusFor = (pointCount: number): unknown =>
      evaluatePaint(paintOf(clusterLayer), 'circle-radius', {
        properties: clusterProperties(pointCount),
      })

    expect(radiusFor(1)).toBe(16)
    expect(radiusFor(4)).toBe(16)
    expect(radiusFor(5)).toBe(20)
    expect(radiusFor(15)).toBe(24)
    expect(radiusFor(40)).toBe(29)
  })

  it('rings the cluster so it reads over terrain and historical sheets', () => {
    expect(
      evaluatePaint(paintOf(clusterLayer), 'circle-stroke-width', {
        properties: clusterProperties(1),
      }),
    ).toBe(3)
    expect(
      evaluatePaint(paintOf(clusterLayer), 'circle-stroke-width', {
        properties: clusterProperties(20),
      }),
    ).toBe(4)
    expect(paintOf(clusterLayer)['circle-stroke-color']).toBe(
      CLUSTER_RING_COLOR,
    )
    expect(paintOf(clusterLayer)['circle-color']).toBe(CLUSTER_COLOR)
  })

  it('renders the abbreviated count in high-contrast haloed text', () => {
    expect(
      (clusterCountLayer as { layout: Record<string, unknown> }).layout[
        'text-field'
      ],
    ).toBe('{point_count_abbreviated}')
    expect(paintOf(clusterCountLayer)['text-color']).toBe(CLUSTER_RING_COLOR)
    expect(paintOf(clusterCountLayer)['text-halo-color']).toBe(CLUSTER_COLOR)
  })
})

describe('unclustered site layer', () => {
  const paint = paintOf(unclusteredLayer)
  const evaluate = (
    property: string,
    featureState: Record<string, unknown>,
  ): unknown => evaluatePaint(paint, property, { featureState })

  it('is filtered to unclustered features', () => {
    expect((unclusteredLayer as { filter: unknown }).filter).toEqual([
      '!',
      ['has', 'point_count'],
    ])
  })

  it('colours a marker by the evidence its site carries', () => {
    expect(
      evaluate('circle-color', { siteCode: SITE_MARKER_CODES.coordinates }),
    ).toBe(SITE_COLOR_COORDINATES)
    expect(
      evaluate('circle-color', {
        siteCode: SITE_MARKER_CODES.excavationPolygons,
      }),
    ).toBe(SITE_COLOR_EXCAVATION)
    expect(
      evaluate('circle-color', {
        siteCode: SITE_MARKER_CODES.fragmentMapData,
      }),
    ).toBe(SITE_COLOR_FRAGMENT_DATA)
  })

  it('enlarges a marker whose site has mapped excavation polygons', () => {
    expect(
      evaluate('circle-radius', { siteCode: SITE_MARKER_CODES.coordinates }),
    ).toBe(6.5)
    expect(
      evaluate('circle-radius', {
        siteCode: SITE_MARKER_CODES.excavationPolygons,
      }),
    ).toBe(8)
  })

  it('thickens the collar of a site carrying historical overlays', () => {
    expect(evaluate('circle-stroke-width', { historicalMapCount: 0 })).toBe(2)
    expect(evaluate('circle-stroke-width', { historicalMapCount: 4 })).toBe(3)
  })

  it('adds a selection ring without changing marker identity', () => {
    expect(
      evaluate('circle-color', {
        selected: true,
        siteCode: SITE_MARKER_CODES.fragmentMapData,
      }),
    ).toBe(SITE_COLOR_SELECTED)
    expect(evaluate('circle-radius', { selected: true })).toBe(11)
    expect(evaluate('circle-stroke-width', { selected: true })).toBe(5)
  })

  it('defaults to the coordinates-only appearance without feature state', () => {
    expect(evaluatePaint(paint, 'circle-color', { featureState: {} })).toBe(
      SITE_COLOR_COORDINATES,
    )
    expect(paint['circle-stroke-color']).toBe('#ffffff')
  })
})
