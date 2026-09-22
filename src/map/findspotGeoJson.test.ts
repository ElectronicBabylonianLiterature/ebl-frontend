import { createHash } from 'crypto'
import fs from 'fs'
import path from 'path'
import type { FeatureCollection, Geometry } from 'geojson'

const root = path.resolve(__dirname, '../..')
const expectedAssetDigests = {
  all: 'a100921caa5afe22136d9cdce563ff2ab0c9a495976f276d041d582dc7be6e93',
  assur: 'd3691796dfe4167898e6cc89db37c8cf0353b0c2360db358e44659096bafecb3',
  kalhu: 'b2a662485a2bad09955c7bda294ed0427d696fea592cd29823b9634ae0c0bfef',
  nippur: '1cb185a16c6b8b07f0e3c405bf5d139678b0bb811a521332823fca530dda4aeb',
  uruk: 'f26ade32a7113e8a6448b39b4a1f1da08b6f2152dbc0c3f25d7f9ff8e295e37b',
} as const
const expectedSites = {
  assur: { count: 134, name: 'Aššur' },
  kalhu: { count: 12, name: 'Kalḫu' },
  nippur: { count: 20, name: 'Nippur' },
  uruk: { count: 128, name: 'Uruk' },
} as const

type SiteId = keyof typeof expectedSites
type AssetName = keyof typeof expectedAssetDigests

function assetPath(fileName: AssetName): string {
  return path.join(
    root,
    'public',
    'map-data',
    'findspots',
    `${fileName}.geojson`,
  )
}

function readGeoJson(fileName: AssetName): FeatureCollection {
  return JSON.parse(fs.readFileSync(assetPath(fileName), 'utf8'))
}

function visitCoordinates(
  geometry: Geometry,
  check: (point: number[]) => void,
): void {
  if (geometry.type === 'Polygon') {
    geometry.coordinates.flat(1).forEach(check)
  } else if (geometry.type === 'MultiPolygon') {
    geometry.coordinates.flat(2).forEach(check)
  }
}

describe('normalized findspot GeoJSON', () => {
  it('matches the reviewed authoritative output digests', () => {
    for (const [fileName, expectedDigest] of Object.entries(
      expectedAssetDigests,
    ) as [AssetName, string][]) {
      const digest = createHash('sha256')
        .update(fs.readFileSync(assetPath(fileName)))
        .digest('hex')

      expect(digest).toBe(expectedDigest)
    }
  })

  it('contains the exact per-site collections and combined feature order', () => {
    const siteFeatures = (
      Object.entries(expectedSites) as [
        SiteId,
        (typeof expectedSites)[SiteId],
      ][]
    ).flatMap(([siteId, expected]) => {
      const geojson = readGeoJson(siteId)
      expect(geojson.type).toBe('FeatureCollection')
      expect(geojson.features).toHaveLength(expected.count)
      return geojson.features
    })
    const combined = readGeoJson('all')

    expect(siteFeatures).toHaveLength(294)
    expect(combined.type).toBe('FeatureCollection')
    expect(combined.features).toEqual(siteFeatures)
  })

  it('has unique canonical IDs and exact site metadata', () => {
    const ids = new Set<string>()

    for (const [siteId, expected] of Object.entries(expectedSites) as [
      SiteId,
      (typeof expectedSites)[SiteId],
    ][]) {
      for (const feature of readGeoJson(siteId).features) {
        const id = String(feature.id)
        expect(id).toMatch(new RegExp(`^${siteId}-.+-[a-f0-9]{12}$`))
        expect(feature.properties?.id).toBe(id)
        expect(feature.properties?.siteId).toBe(siteId)
        expect(feature.properties?.siteName).toBe(expected.name)
        expect(ids.has(id)).toBe(false)
        ids.add(id)
      }
    }

    expect(ids.size).toBe(294)
  })

  it('contains polygonal EPSG:4326 geometry and display properties', () => {
    for (const siteId of Object.keys(expectedSites) as SiteId[]) {
      for (const feature of readGeoJson(siteId).features) {
        expect(feature.properties?.locationType).toBe('excavation_area')
        expect(feature.properties?.name).toEqual(expect.any(String))
        expect(['Polygon', 'MultiPolygon']).toContain(feature.geometry.type)
        visitCoordinates(feature.geometry, ([longitude, latitude]) => {
          expect(Number.isFinite(longitude)).toBe(true)
          expect(Number.isFinite(latitude)).toBe(true)
          expect(longitude).toBeGreaterThanOrEqual(-180)
          expect(longitude).toBeLessThanOrEqual(180)
          expect(latitude).toBeGreaterThanOrEqual(-90)
          expect(latitude).toBeLessThanOrEqual(90)
        })
      }
    }
  })

  it('keeps duplicate display names distinct by geometry identity', () => {
    const duplicateNameFeatures = readGeoJson('uruk').features.filter(
      (feature) => feature.properties?.name === 'Pd XVI/4',
    )

    expect(duplicateNameFeatures).toHaveLength(2)
    expect(
      new Set(duplicateNameFeatures.map((feature) => feature.id)).size,
    ).toBe(2)
  })

  it('preserves supplied source IDs outside Uruk', () => {
    for (const feature of readGeoJson('uruk').features) {
      expect(feature.properties?.sourceId).toBeUndefined()
    }
    for (const siteId of ['assur', 'kalhu', 'nippur'] as const) {
      expect(
        readGeoJson(siteId).features.every(
          (feature) => feature.properties?.sourceId !== undefined,
        ),
      ).toBe(true)
    }
  })
})
