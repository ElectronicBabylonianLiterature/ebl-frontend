import { execFileSync } from 'child_process'
import crypto from 'crypto'
import fs from 'fs'
import os from 'os'
import path from 'path'
import type { FeatureCollection } from 'geojson'

const root = path.resolve(__dirname, '../..')
const fixtureDir = path.join(
  root,
  'src',
  'test-support',
  'map-generator-fixtures',
)
const generator = path.join(
  root,
  'scripts',
  'maps',
  'build-findspot-map-assets.py',
)

type InventoryRecord = { polygonId: string; name: string }
type MappingRecord = { findspotId: number; polygonIds: string[] }

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T
}

function makeWorkDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'findspot-generator-'))
  for (const file of fs.readdirSync(fixtureDir)) {
    fs.copyFileSync(path.join(fixtureDir, file), path.join(dir, file))
  }
  return dir
}

function runGenerator(
  dir: string,
  overrides: Partial<Record<string, string>> = {},
): void {
  execFileSync(
    'python3',
    [
      generator,
      '--findspot-dir',
      dir,
      '--polygon-inventory',
      overrides.inventory ?? path.join(dir, 'inventory.json'),
      '--mapping-artifact',
      overrides.mapping ?? path.join(dir, 'mapping.json'),
      '--expectations',
      path.join(dir, 'expectations.json'),
    ],
    { stdio: 'pipe' },
  )
}

function hashFile(file: string): string {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
}

function writeBroken(
  dir: string,
  mutate: (inventory: InventoryRecord[], mapping: MappingRecord[]) => void,
): Record<string, string> {
  const inventory = readJson<InventoryRecord[]>(
    path.join(dir, 'inventory.json'),
  )
  const mapping = readJson<MappingRecord[]>(path.join(dir, 'mapping.json'))
  mutate(inventory, mapping)

  const inventoryPath = path.join(dir, 'broken-inventory.json')
  const mappingPath = path.join(dir, 'broken-mapping.json')
  fs.writeFileSync(inventoryPath, JSON.stringify(inventory))
  fs.writeFileSync(mappingPath, JSON.stringify(mapping))

  return { inventory: inventoryPath, mapping: mappingPath }
}

function expectFailureKeepsOutput(
  mutate: (inventory: InventoryRecord[], mapping: MappingRecord[]) => void,
): void {
  const dir = makeWorkDir()
  const overrides = writeBroken(dir, mutate)
  const before = hashFile(path.join(dir, 'assur.geojson'))

  expect(() => runGenerator(dir, overrides)).toThrow()
  expect(hashFile(path.join(dir, 'assur.geojson'))).toBe(before)
}

describe('canonicalization contract', () => {
  it('replaces ordinal ids with canonical inventory ids', () => {
    const dir = makeWorkDir()

    runGenerator(dir)

    const features = readJson<FeatureCollection>(
      path.join(dir, 'assur.geojson'),
    ).features

    expect(features.map((feature) => feature.id)).toEqual([
      'assur-aa1i-1111aaaa1111',
      'assur-aa2i-2222bbbb2222',
    ])
    expect(
      features.every((feature) => feature.properties?.id === feature.id),
    ).toBe(true)
  })

  it('writes an all.geojson containing every site', () => {
    const dir = makeWorkDir()

    runGenerator(dir)

    const all = readJson<FeatureCollection>(path.join(dir, 'all.geojson'))
    const siteIds = all.features.map((feature) => feature.properties?.siteId)

    expect(all.features).toHaveLength(5)
    expect(new Set(siteIds)).toEqual(
      new Set(['assur', 'kalhu', 'nippur', 'uruk']),
    )
  })

  it('is deterministic for identical inputs', () => {
    const first = makeWorkDir()
    const second = makeWorkDir()

    runGenerator(first)
    runGenerator(second)

    expect(hashFile(path.join(first, 'assur.geojson'))).toBe(
      hashFile(path.join(second, 'assur.geojson')),
    )
  })

  it('leaves non-Aššur sites untouched', () => {
    const dir = makeWorkDir()
    const before = hashFile(path.join(dir, 'uruk.geojson'))

    runGenerator(dir)

    expect(hashFile(path.join(dir, 'uruk.geojson'))).toBe(before)
  })
})

describe('failure modes leave assets untouched', () => {
  it('rejects a missing inventory match', () => {
    expectFailureKeepsOutput((inventory) => {
      inventory[0].name = 'not-a-source-name'
    })
  })

  it('rejects ambiguous inventory source names', () => {
    expectFailureKeepsOutput((inventory) => {
      inventory[1].name = inventory[0].name
    })
  })

  it('rejects an unused inventory entry', () => {
    expectFailureKeepsOutput((inventory) => {
      inventory.push({ polygonId: 'assur-extra-3333cccc3333', name: 'aA9I' })
    })
  })

  it('rejects a mapping referencing an unknown polygon', () => {
    expectFailureKeepsOutput((_inventory, mapping) => {
      mapping[0].polygonIds = ['assur-missing-4444dddd4444']
    })
  })

  it('rejects a legacy ordinal polygon id in the inventory', () => {
    expectFailureKeepsOutput((inventory) => {
      inventory[0].polygonId = 'assur-1'
    })
  })

  it('rejects duplicate findspot ids', () => {
    expectFailureKeepsOutput((_inventory, mapping) => {
      mapping[1].findspotId = mapping[0].findspotId
    })
  })
})
