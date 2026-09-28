import fs from 'fs'
import path from 'path'
import type { FeatureCollection, Polygon } from 'geojson'
import {
  type InventoryRecord,
  type MappingRecord,
  artifactPath,
  fixtureDir,
  makeWorkDir,
  outputHashes,
  outputNames,
  readJson,
  runGenerator,
  sites,
  writeJson,
} from 'map/findspotGeneratorTestSupport'

function mutateInventory(
  directory: string,
  site: string,
  mutate: (records: InventoryRecord[]) => void,
): void {
  const file = artifactPath(directory, site, 'polygon_inventory')
  const records = readJson<InventoryRecord[]>(file)
  mutate(records)
  writeJson(file, records)
}

function mutateMapping(
  directory: string,
  site: string,
  mutate: (records: MappingRecord[]) => void,
): void {
  const file = artifactPath(directory, site, 'findspot_polygon_mappings')
  const records = readJson<MappingRecord[]>(file)
  mutate(records)
  writeJson(file, records)
}

function expectFailureKeepsEveryOutput(
  mutate: (directory: string) => void,
): void {
  const directory = makeWorkDir()
  const before = outputHashes(directory)
  mutate(directory)

  expect(() => runGenerator(directory)).toThrow()
  expect(outputHashes(directory)).toEqual(before)
}

describe('multi-site canonicalization contract', () => {
  it('replaces every feature id with its exact geometry inventory id', () => {
    const directory = makeWorkDir()

    runGenerator(directory)

    for (const site of sites) {
      const inventory = readJson<InventoryRecord[]>(
        artifactPath(directory, site, 'polygon_inventory'),
      )
      const expectedIds = new Set(inventory.map(({ polygonId }) => polygonId))
      const features = readJson<FeatureCollection>(
        path.join(directory, `${site}.geojson`),
      ).features
      expect(new Set(features.map(({ id }) => id))).toEqual(expectedIds)
      expect(
        features.every((feature) => feature.properties?.id === feature.id),
      ).toBe(true)
    }
  })

  it('keeps duplicate names distinct through geometry identity', () => {
    const directory = makeWorkDir()

    runGenerator(directory)

    const features = readJson<FeatureCollection>(
      path.join(directory, 'uruk.geojson'),
    ).features.filter(({ properties }) => properties?.name === 'Area 1')
    expect(features).toHaveLength(2)
    expect(new Set(features.map(({ id }) => id)).size).toBe(2)
  })

  it('preserves every geometry while rebuilding all.geojson', () => {
    const directory = makeWorkDir()
    const geometries = Object.fromEntries(
      sites.map((site) => [
        site,
        readJson<FeatureCollection>(
          path.join(directory, `${site}.geojson`),
        ).features.map(({ geometry }) => geometry),
      ]),
    )

    runGenerator(directory)

    for (const site of sites) {
      expect(
        readJson<FeatureCollection>(
          path.join(directory, `${site}.geojson`),
        ).features.map(({ geometry }) => geometry),
      ).toEqual(geometries[site])
    }
    expect(
      readJson<FeatureCollection>(path.join(directory, 'all.geojson')).features,
    ).toHaveLength(6)
  })

  it('matches every reviewed golden output byte for byte', () => {
    const directory = makeWorkDir()

    runGenerator(directory)

    for (const name of outputNames) {
      expect(fs.readFileSync(path.join(directory, `${name}.geojson`))).toEqual(
        fs.readFileSync(path.join(fixtureDir, `expected-${name}.geojson`)),
      )
    }
  })

  it('is deterministic for identical inputs', () => {
    const first = makeWorkDir()
    const second = makeWorkDir()

    runGenerator(first)
    runGenerator(second)

    expect(outputHashes(first)).toEqual(outputHashes(second))
  })
})

describe('invalid inputs leave every output untouched', () => {
  it('rejects geometry without an exact inventory checksum', () => {
    expectFailureKeepsEveryOutput((directory) => {
      mutateInventory(directory, 'kalhu', (records) => {
        records[0].geometryChecksum = '000000000000'
        records[0].polygonId = 'kalhu-area-1-000000000000'
      })
    })
  })

  it('rejects an inventory name that disagrees with matched geometry', () => {
    expectFailureKeepsEveryOutput((directory) => {
      mutateInventory(directory, 'nippur', (records) => {
        records[0].name = 'Different area'
      })
    })
  })

  it('rejects a mapping to an unknown polygon', () => {
    expectFailureKeepsEveryOutput((directory) => {
      mutateMapping(directory, 'uruk', (records) => {
        records[0].polygonIds = ['uruk-missing-000000000000']
      })
    })
  })

  it('rejects non-authoritative mapping semantics and provenance', () => {
    expectFailureKeepsEveryOutput((directory) => {
      mutateMapping(directory, 'kalhu', (records) => {
        records[0].locationPrecision = 'site'
      })
    })
    expectFailureKeepsEveryOutput((directory) => {
      mutateMapping(directory, 'nippur', (records) => {
        records[0].matchMethod = 'guessed'
        records[0].source = ' '
      })
    })
  })

  it('rejects malformed canonical ids and out-of-bounds geometry', () => {
    expectFailureKeepsEveryOutput((directory) => {
      mutateInventory(directory, 'kalhu', (records) => {
        records[0].polygonId = `kalhu-wrong-${records[0].geometryChecksum}`
      })
    })
    const directory = makeWorkDir()
    const file = path.join(directory, 'nippur.geojson')
    const collection = readJson<FeatureCollection<Polygon>>(file)
    collection.features[0].geometry.coordinates[0][0][0] = 181
    writeJson(file, collection)
    const before = outputHashes(directory)

    expect(() => runGenerator(directory)).toThrow()
    expect(outputHashes(directory)).toEqual(before)
  })

  it('rejects findspot ids reused by another site', () => {
    expectFailureKeepsEveryOutput((directory) => {
      mutateMapping(directory, 'kalhu', (records) => {
        records[0].findspotId = 0
      })
    })
  })

  it('accepts zero but rejects duplicate and negative findspot ids', () => {
    expectFailureKeepsEveryOutput((directory) => {
      mutateMapping(directory, 'assur', (records) => {
        records[1].findspotId = records[0].findspotId
      })
    })
    expectFailureKeepsEveryOutput((directory) => {
      mutateMapping(directory, 'kalhu', (records) => {
        records[0].findspotId = -1
      })
    })
  })
})
