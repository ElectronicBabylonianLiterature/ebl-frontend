import fs from 'fs'
import path from 'path'
import type { FeatureCollection } from 'geojson'
import {
  EXCAVATION_POLYGON_GEOJSON_URL,
  fetchExcavationPolygonIndex,
} from 'map/domain/excavationPolygonIndex'
import { featureCollection, polygonFeature } from 'test-support/map-fixtures'

const root = path.resolve(__dirname, '../../..')
const canonicalCollection = JSON.parse(
  fs.readFileSync(
    path.join(root, 'public/map-data/findspots/all.geojson'),
    'utf8',
  ),
) as FeatureCollection

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
    ['an empty collection', featureCollection([])],
    [
      'an incomplete collection',
      featureCollection([polygonFeature('assur-a', 'assur')]),
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
