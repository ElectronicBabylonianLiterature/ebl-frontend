import {
  buildExcavationPolygonIndex,
  findExcavationPolygon,
  sortedExcavationPolygons,
} from 'map/domain/excavationPolygonIndex'
import { featureCollection, polygonFeature } from 'test-support/map-fixtures'

describe('buildExcavationPolygonIndex', () => {
  it('indexes multipolygons while rejecting non-polygon geometries', () => {
    const feature = polygonFeature('assur-multi', 'assur')
    const index = buildExcavationPolygonIndex(
      featureCollection([
        {
          ...feature,
          geometry: {
            type: 'MultiPolygon',
            coordinates: [feature.geometry.coordinates],
          },
        },
        {
          ...polygonFeature('assur-point', 'assur'),
          geometry: { type: 'Point', coordinates: [0, 0] },
        },
        { ...polygonFeature('assur-null', 'assur'), geometry: null },
      ]),
    )
    expect(index.get('assur')).toHaveLength(1)
    expect(index.get('assur')?.[0].geometry.type).toBe('MultiPolygon')
  })

  it.each([undefined, 'Polygon'])('rejects a feature with type %s', (type) => {
    expect(
      buildExcavationPolygonIndex(
        featureCollection([{ ...polygonFeature('assur-a', 'assur'), type }]),
      ).size,
    ).toBe(0)
  })

  it('groups polygons by canonical site id', () => {
    const index = buildExcavationPolygonIndex(
      featureCollection([
        polygonFeature('assur-a', 'assur'),
        polygonFeature('assur-b', 'assur'),
        polygonFeature('uruk-a', 'uruk'),
      ]),
    )

    expect([...index.keys()]).toEqual(['assur', 'uruk'])
    expect(index.get('assur')).toHaveLength(2)
    expect(index.get('uruk')?.[0]).toMatchObject({
      polygonId: 'uruk-a',
      siteId: 'uruk',
      name: 'Area A',
      bounds: [43.25, 35.45, 43.26, 35.46],
    })
    expect(index.get('uruk')?.[0].areaSquareKm).toBeGreaterThan(0)
  })

  it('keeps the first of a duplicated canonical id', () => {
    const index = buildExcavationPolygonIndex(
      featureCollection([
        polygonFeature('assur-a', 'assur', 'First'),
        polygonFeature('assur-a', 'assur', 'Second'),
      ]),
    )

    expect(index.get('assur')).toHaveLength(1)
    expect(index.get('assur')?.[0].name).toBe('First')
  })

  it('accepts multipolygons and sorts unnamed polygons by id', () => {
    const first = polygonFeature('assur-a', 'assur')
    const second = polygonFeature('uruk-b', 'uruk')
    const features = [second, first].map((feature) => ({
      ...feature,
      properties: { ...feature.properties, name: null },
      geometry: {
        type: 'MultiPolygon',
        coordinates: [feature.geometry.coordinates],
      },
    }))
    const index = buildExcavationPolygonIndex(featureCollection(features))

    expect(
      sortedExcavationPolygons(index).map(({ polygonId }) => polygonId),
    ).toEqual(['assur-a', 'uruk-b'])
  })

  it('rejects features from an unknown site', () => {
    expect(
      buildExcavationPolygonIndex(
        featureCollection([polygonFeature('unknown-a', 'unknown')]),
      ).size,
    ).toBe(0)
  })

  it('rejects features whose feature id does not match the canonical property', () => {
    const feature = polygonFeature('assur-a', 'assur')

    expect(
      buildExcavationPolygonIndex(
        featureCollection([{ ...feature, id: 'other-id' }]),
      ).size,
    ).toBe(0)
  })

  it.each([
    ['a missing id property', { properties: { siteId: 'assur' } }],
    ['a missing site id', { properties: { id: 'assur-a' } }],
    ['a blank id', { properties: { id: '  ', siteId: 'assur' } }],
    ['null properties', { properties: null }],
  ])('rejects %s', (_label, overrides) => {
    const feature = { ...polygonFeature('assur-a', 'assur'), ...overrides }

    expect(buildExcavationPolygonIndex(featureCollection([feature])).size).toBe(
      0,
    )
  })

  it.each([
    ['a non-collection', {}],
    ['a null payload', null],
    ['a non-array features field', { features: 'nope' }],
  ])('returns an empty index for %s', (_label, payload) => {
    expect(buildExcavationPolygonIndex(payload).size).toBe(0)
  })

  it('reports a null bounding box for empty geometry', () => {
    const feature = polygonFeature('assur-a', 'assur')
    const index = buildExcavationPolygonIndex(
      featureCollection([
        { ...feature, geometry: { type: 'Polygon', coordinates: [] } },
      ]),
    )

    expect(index.get('assur')?.[0].bounds).toBeNull()
  })

  it('finds polygons by id and sorts them by display label', () => {
    const index = buildExcavationPolygonIndex(
      featureCollection([
        polygonFeature('second', 'assur', 'Zulu'),
        polygonFeature('first', 'uruk', 'Alpha'),
      ]),
    )

    expect(findExcavationPolygon(index, 'second')?.name).toBe('Zulu')
    expect(findExcavationPolygon(index, 'missing')).toBeNull()
    expect(findExcavationPolygon(index, null)).toBeNull()
    expect(
      sortedExcavationPolygons(index).map(({ polygonId }) => polygonId),
    ).toEqual(['first', 'second'])
  })
})
