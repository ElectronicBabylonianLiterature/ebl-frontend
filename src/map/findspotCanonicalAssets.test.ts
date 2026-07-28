import { execFileSync } from 'child_process'
import crypto from 'crypto'
import fs from 'fs'
import os from 'os'
import path from 'path'
import type { Feature, FeatureCollection, Geometry } from 'geojson'

const root = path.resolve(__dirname, '../..')
const findspotDir = path.join(root, 'public', 'map-data', 'findspots')
const inventoryPath = path.join(
  root,
  '.map-processing',
  'backend-artifacts',
  'assur_polygon_inventory.json',
)
const mappingPath = path.join(
  root,
  '.map-processing',
  'backend-artifacts',
  'assur_findspot_polygon_mappings.json',
)
const generator = path.join(
  root,
  'scripts',
  'maps',
  'build-findspot-map-assets.py',
)

type GeoFeature = Feature<Geometry, Record<string, unknown>>

type InventoryRecord = { polygonId: string; name: string }
type MappingRecord = { findspotId: number; polygonIds: string[] }

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T
}

function readGeoJson(site: string): FeatureCollection {
  return readJson(path.join(findspotDir, `${site}.geojson`))
}

function ids(features: readonly GeoFeature[]): string[] {
  return features.map((feature) => String(feature.id))
}

function hashFile(file: string): string {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
}

function makeWorkDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'assur-assets-'))
  for (const site of ['assur', 'all', 'kalhu', 'nippur', 'uruk']) {
    fs.copyFileSync(
      path.join(findspotDir, `${site}.geojson`),
      path.join(dir, `${site}.geojson`),
    )
  }
  return dir
}

function runGenerator(
  dir: string,
  inventory = inventoryPath,
  mapping = mappingPath,
): void {
  execFileSync(
    'python3',
    [
      generator,
      '--findspot-dir',
      dir,
      '--polygon-inventory',
      inventory,
      '--mapping-artifact',
      mapping,
    ],
    { stdio: 'pipe' },
  )
}

function expectFailureKeepsOutput(
  mutate: (inventory: InventoryRecord[], mapping: MappingRecord[]) => void,
): void {
  const dir = makeWorkDir()
  const inventory = readJson<InventoryRecord[]>(inventoryPath)
  const mapping = readJson<MappingRecord[]>(mappingPath)
  mutate(inventory, mapping)
  const brokenInventory = path.join(dir, 'inventory.json')
  const brokenMapping = path.join(dir, 'mapping.json')
  fs.writeFileSync(brokenInventory, JSON.stringify(inventory))
  fs.writeFileSync(brokenMapping, JSON.stringify(mapping))
  const before = hashFile(path.join(dir, 'assur.geojson'))

  expect(() => runGenerator(dir, brokenInventory, brokenMapping)).toThrow()

  expect(hashFile(path.join(dir, 'assur.geojson'))).toBe(before)
}

describe('canonical Aššur findspot map assets', () => {
  const inventory = readJson<InventoryRecord[]>(inventoryPath)
  const mappings = readJson<MappingRecord[]>(mappingPath)
  const inventoryIds = new Set(inventory.map((record) => record.polygonId))
  const mappedIds = new Set(mappings.flatMap((record) => record.polygonIds))

  it('uses 134 unique canonical Aššur IDs with the corrected bB6I polygon', () => {
    const features = readGeoJson('assur').features as GeoFeature[]
    const featureIds = ids(features)

    expect(features).toHaveLength(134)
    expect(new Set(featureIds).size).toBe(134)
    expect(featureIds).not.toContain('assur-u001a-a1ccc873746b')
    expect(featureIds).toContain('assur-bb6i-3d76dc1e02af')
    expect(featureIds.every((id) => !/^assur-\d+$/.test(id))).toBe(true)
    expect(
      features.every((feature) => feature.properties?.id === feature.id),
    ).toBe(true)
  })

  it('covers the canonical inventory and all mapped polygon IDs exactly', () => {
    const featureIds = new Set(
      ids(readGeoJson('assur').features as GeoFeature[]),
    )

    expect(inventory).toHaveLength(134)
    expect(inventoryIds.size).toBe(134)
    expect(mappings).toHaveLength(317)
    expect(new Set(mappings.map((record) => record.findspotId)).size).toBe(317)
    expect(mappedIds.size).toBe(133)
    expect([...mappedIds].filter((id) => !featureIds.has(id))).toEqual([])
    expect([...featureIds].filter((id) => !inventoryIds.has(id))).toEqual([])
  })

  it('preserves all non-Aššur site data in all.geojson', () => {
    const all = readGeoJson('all').features as GeoFeature[]
    const counts = ['assur', 'kalhu', 'nippur', 'uruk'].map((site) => [
      site,
      all.filter((feature) => feature.properties?.siteId === site).length,
    ])

    expect(Object.fromEntries(counts)).toEqual({
      assur: 134,
      kalhu: 12,
      nippur: 20,
      uruk: 128,
    })
    for (const site of ['kalhu', 'nippur', 'uruk']) {
      expect(
        all.filter((feature) => feature.properties?.siteId === site),
      ).toEqual(readGeoJson(site).features)
    }
  })

  it('generates deterministic output from identical inputs', () => {
    const dir = makeWorkDir()

    runGenerator(dir)
    const first = [
      hashFile(path.join(dir, 'assur.geojson')),
      hashFile(path.join(dir, 'all.geojson')),
    ]
    runGenerator(dir)
    const second = [
      hashFile(path.join(dir, 'assur.geojson')),
      hashFile(path.join(dir, 'all.geojson')),
    ]

    expect(second).toEqual(first)
  })

  it('fails without partial output when an inventory match is missing', () => {
    expectFailureKeepsOutput((inventory) => {
      inventory.find((record) => record.name === 'bB6I')!.name = 'missing'
    })
  })

  it('fails without partial output when inventory source names are ambiguous', () => {
    expectFailureKeepsOutput((inventory) => {
      inventory[0] = { ...inventory[0], name: inventory[1].name }
    })
  })

  it('fails without partial output when an inventory entry is unused', () => {
    expectFailureKeepsOutput((inventory) => {
      inventory.push({
        ...inventory[0],
        name: 'unused',
        polygonId: 'assur-unused-000000000000',
      })
    })
  })

  it('fails without partial output when a mapping references an unknown polygon', () => {
    expectFailureKeepsOutput((_inventory, mapping) => {
      mapping[0] = { ...mapping[0], polygonIds: ['assur-unknown-000000000000'] }
    })
  })
})
