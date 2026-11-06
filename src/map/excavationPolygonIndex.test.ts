import fs from 'fs'
import path from 'path'
import type { FeatureCollection } from 'geojson'
import {
  EXCAVATION_POLYGON_GEOJSON_URL,
  buildExcavationPolygonIndex,
  fetchExcavationPolygonIndex,
} from 'map/excavationPolygonIndex'
import { polygonFeature } from 'test-support/map-fixtures'

const root = path.resolve(__dirname, '../..')
const canonicalCollection = JSON.parse(
  fs.readFileSync(
    path.join(root, 'public/map-data/findspots/all.geojson'),
    'utf8',
  ),
) as FeatureCollection

function collection(features: unknown[]): unknown {
  return { type: 'FeatureCollection', features }
}

describe('buildExcavationPolygonIndex', () => {
  it.each([undefined, 'Polygon'])('rejects a feature with type %s', (type) => {
    expect(
      buildExcavationPolygonIndex(
        collection([{ ...polygonFeature('assur-a', 'assur'), type }]),
      ).size,
    ).toBe(0)
  })

  it('groups polygons by canonical site id', () => {
    const index = buildExcavationPolygonIndex(
      collection([
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
      collection([
        polygonFeature('assur-a', 'assur', 'First'),
        polygonFeature('assur-a', 'assur', 'Second'),
      ]),
    )

    expect(index.get('assur')).toHaveLength(1)
    expect(index.get('assur')?.[0].name).toBe('First')
  })

  it('rejects features from an unknown site', () => {
    expect(
      buildExcavationPolygonIndex(
        collection([polygonFeature('unknown-a', 'unknown')]),
      ).size,
    ).toBe(0)
  })

  it('rejects features whose feature id does not match the canonical property', () => {
    const feature = polygonFeature('assur-a', 'assur')

    expect(
      buildExcavationPolygonIndex(collection([{ ...feature, id: 'other-id' }]))
        .size,
    ).toBe(0)
  })

  it.each([
    ['a missing id property', { properties: { siteId: 'assur' } }],
    ['a missing site id', { properties: { id: 'assur-a' } }],
    ['a blank id', { properties: { id: '  ', siteId: 'assur' } }],
    ['null properties', { properties: null }],
  ])('rejects %s', (_label, overrides) => {
    const feature = { ...polygonFeature('assur-a', 'assur'), ...overrides }

    expect(buildExcavationPolygonIndex(collection([feature])).size).toBe(0)
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
      collection([
        { ...feature, geometry: { type: 'Polygon', coordinates: [] } },
      ]),
    )

    expect(index.get('assur')?.[0].bounds).toBeNull()
  })
})

describe('fetchExcavationPolygonIndex', () => {
  const fetchMock = jest.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    global.fetch = fetchMock as unknown as typeof fetch
  })

  it('requests the complete canonical asset and builds the index', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(canonicalCollection),
    })

    const index = await fetchExcavationPolygonIndex()

    expect(fetchMock).toHaveBeenCalledWith(EXCAVATION_POLYGON_GEOJSON_URL)
    expect(index.get('assur')).toHaveLength(134)
    expect(index.get('kalhu')).toHaveLength(12)
    expect(index.get('nippur')).toHaveLength(20)
    expect(index.get('uruk')).toHaveLength(128)
  })

  it.each([undefined, 'Polygon'])(
    'rejects a canonical asset containing a feature with type %s',
    async (type) => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            ...canonicalCollection,
            features: canonicalCollection.features.map((feature, index) =>
              index === 0 ? { ...feature, type } : feature,
            ),
          }),
      })

      await expect(fetchExcavationPolygonIndex()).rejects.toThrow(
        'Excavation polygon asset is invalid for assur',
      )
    },
  )

  it.each([
    ['a malformed payload', {}],
    ['an empty collection', collection([])],
    [
      'an incomplete collection',
      collection([polygonFeature('assur-a', 'assur')]),
    ],
  ])('rejects HTTP-200 %s', async (_label, payload) => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(payload),
    })

    await expect(fetchExcavationPolygonIndex()).rejects.toThrow(
      'Excavation polygon asset',
    )
  })

  it('rejects a full-size asset with no recognized sites', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          ...canonicalCollection,
          features: canonicalCollection.features.map((feature) => ({
            ...feature,
            properties: { ...feature.properties, siteId: 'unknown' },
          })),
        }),
    })

    await expect(fetchExcavationPolygonIndex()).rejects.toThrow(
      'Excavation polygon asset is invalid for assur',
    )
  })

  it('rejects when the asset is unavailable', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 404 })

    await expect(fetchExcavationPolygonIndex()).rejects.toThrow(
      'Excavation polygon assets unavailable (404)',
    )
  })
})
