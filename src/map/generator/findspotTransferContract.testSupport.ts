import crypto from 'crypto'
import path from 'path'
import {
  artifactPath,
  hashFile,
  readJson,
  sites,
  writeJson,
  type InventoryRecord,
  type MappingRecord,
} from 'map/generator/findspotGeneratorTestSupport'

export interface TransferContractFixture {
  schemaVersion: number | boolean
  contractVersion: string
  geometryContractVersion: string
  canonicalCrs: string
  geometryIncluded: boolean
  generatorVersion: string
  producer: { repository: string; commit: string; dirtyWorktree: boolean }
  sites: Record<
    string,
    {
      siteId: string
      siteName: string
      authoritativeSource: string
      sourceCrs: string
      sourceRevision: string
      polygonCount: number
      mappingCount: number
      distinctMappedPolygonCount: number
      unresolvedCount: number
    }
  >
  fileChecksums: Record<string, string>
  expectations: Record<string, Record<string, number>>
  contractRevision: string
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
      .join(',')}}`
  }
  return JSON.stringify(value) ?? 'null'
}

export function writeTransferContract(
  directory: string,
  contract: TransferContractFixture,
): void {
  const stable = Object.fromEntries(
    Object.entries(contract).filter(
      ([key]) => !['producer', 'contractRevision'].includes(key),
    ),
  )
  contract.contractRevision =
    'sha256:' +
    crypto.createHash('sha256').update(canonicalJson(stable)).digest('hex')
  writeJson(path.join(directory, 'ARTIFACT_MANIFEST.json'), contract)
}

export function transferContract(directory: string): TransferContractFixture {
  const definitions = Object.fromEntries(
    sites.map((site) => {
      const inventory = readJson<InventoryRecord[]>(
        artifactPath(directory, site, 'polygon_inventory'),
      )
      const mappings = readJson<MappingRecord[]>(
        artifactPath(directory, site, 'findspot_polygon_mappings'),
      )
      return [
        site.toUpperCase(),
        {
          siteId: site.toUpperCase(),
          siteName: inventory[0].siteName,
          authoritativeSource: 'independent test fixture',
          sourceCrs: 'EPSG:4326',
          sourceRevision: mappings[0].sourceRevision,
          polygonCount: inventory.length,
          mappingCount: mappings.length,
          distinctMappedPolygonCount: new Set(
            mappings.flatMap((row) => row.polygonIds),
          ).size,
          unresolvedCount: 0,
        },
      ]
    }),
  )
  const contract: TransferContractFixture = {
    schemaVersion: 1,
    contractVersion: 'ebl-map-metadata/1',
    geometryContractVersion: 'ebl-excavation-polygons/1',
    canonicalCrs: 'EPSG:4326',
    geometryIncluded: false,
    generatorVersion: 'map_artifact_generator/3',
    producer: {
      repository: 'ElectronicBabylonianLiterature/ebl-api',
      commit: 'a'.repeat(40),
      dirtyWorktree: false,
    },
    sites: definitions,
    fileChecksums: Object.fromEntries(
      sites.flatMap((site) =>
        ['polygon_inventory', 'findspot_polygon_mappings'].map((suffix) => {
          const file = artifactPath(directory, site, suffix)
          return [path.basename(file), hashFile(file)]
        }),
      ),
    ),
    expectations: readJson(path.join(directory, 'expectations.json')),
    contractRevision: '',
  }
  writeTransferContract(directory, contract)
  return contract
}
