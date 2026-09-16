import fs from 'fs'
import path from 'path'
import type { Feature, FeatureCollection, Geometry } from 'geojson'

const root = path.resolve(__dirname, '../..')
const findspotDir = path.join(root, 'public', 'map-data', 'findspots')
const catalogPath = path.join(root, 'public', 'map-data', 'catalog.json')

type GeoFeature = Feature<Geometry, Record<string, unknown>>

interface CatalogSite {
  readonly siteId: string
  readonly siteName: string
  readonly findspotGeoJsonUrl: string
  readonly findspotFeatureCount: number
  readonly rasterOverlayIds: readonly string[]
}

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T
}

function readSite(site: string): readonly GeoFeature[] {
  return readJson<FeatureCollection>(path.join(findspotDir, `${site}.geojson`))
    .features as GeoFeature[]
}

const catalog = readJson<{ sites: readonly CatalogSite[] }>(catalogPath)
const SITES = ['assur', 'kalhu', 'nippur', 'uruk'] as const

describe('committed findspot assets', () => {
  it.each(SITES)('%s matches the catalog feature count', (site) => {
    const declared = catalog.sites.find((entry) => entry.siteId === site)

    expect(declared).toBeDefined()
    expect(readSite(site)).toHaveLength(
      declared?.findspotFeatureCount as number,
    )
  })

  it.each(SITES)('%s uses polygon geometry for every feature', (site) => {
    expect(
      readSite(site).every((feature) => feature.geometry.type === 'Polygon'),
    ).toBe(true)
  })

  it.each(SITES)('%s keeps the feature id equal to properties.id', (site) => {
    expect(
      readSite(site).every((feature) => feature.properties?.id === feature.id),
    ).toBe(true)
  })

  it.each(SITES)('%s has unique feature ids', (site) => {
    const features = readSite(site)

    expect(new Set(features.map((feature) => feature.id)).size).toBe(
      features.length,
    )
  })

  it.each(SITES)('%s tags every feature with its own site id', (site) => {
    expect(
      readSite(site).every((feature) => feature.properties?.siteId === site),
    ).toBe(true)
  })

  it.each(SITES)('%s marks every feature as an excavation area', (site) => {
    expect(
      readSite(site).every(
        (feature) => feature.properties?.locationType === 'excavation_area',
      ),
    ).toBe(true)
  })
})

describe('canonical Aššur identity', () => {
  const features = readSite('assur')

  it('uses checksum-suffixed canonical ids, never legacy ordinals', () => {
    const ids = features.map((feature) => String(feature.id))

    expect(ids.every((id) => !/^assur-\d+$/.test(id))).toBe(true)
    expect(ids.every((id) => /^assur-.+-[0-9a-f]{12}$/.test(id))).toBe(true)
  })

  it('retains the corrected bB6I polygon', () => {
    expect(features.map((feature) => feature.id)).toContain(
      'assur-bb6i-3d76dc1e02af',
    )
  })

  it('gives every feature a non-empty source name', () => {
    expect(
      features.every(
        (feature) =>
          typeof feature.properties?.name === 'string' &&
          (feature.properties.name as string).trim() !== '',
      ),
    ).toBe(true)
  })

  it('has unique source names, so no name is ambiguous', () => {
    const names = features.map((feature) => feature.properties?.name)

    expect(new Set(names).size).toBe(features.length)
  })
})

describe('aggregated all.geojson', () => {
  const allFeatures = readSite('all')

  it('is the exact union of the per-site collections', () => {
    const perSite = SITES.flatMap((site) => readSite(site))

    expect(allFeatures).toHaveLength(perSite.length)
    expect(new Set(allFeatures.map((feature) => feature.id))).toEqual(
      new Set(perSite.map((feature) => feature.id)),
    )
  })

  it('preserves each site’s features verbatim', () => {
    const byId = new Map(
      allFeatures.map((feature) => [String(feature.id), feature]),
    )

    for (const site of SITES) {
      for (const feature of readSite(site)) {
        expect(byId.get(String(feature.id))).toEqual(feature)
      }
    }
  })

  it('has no duplicate canonical ids across sites', () => {
    expect(new Set(allFeatures.map((feature) => feature.id)).size).toBe(
      allFeatures.length,
    )
  })
})

describe('catalog integrity', () => {
  it('declares a geojson url matching each site file', () => {
    for (const site of catalog.sites) {
      expect(site.findspotGeoJsonUrl).toBe(
        `/map-data/findspots/${site.siteId}.geojson`,
      )
    }
  })

  it('declares at least one historical overlay per site', () => {
    for (const site of catalog.sites) {
      expect(site.rasterOverlayIds.length).toBeGreaterThan(0)
    }
  })
})
