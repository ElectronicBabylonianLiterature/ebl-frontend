import fs from 'fs'
import path from 'path'
import {
  artifactPath,
  hashFile,
  makeWorkDir,
  outputHashes,
  readJson,
  runGenerator,
} from 'map/findspotGeneratorTestSupport'
import {
  transferContract,
  writeTransferContract,
  type TransferContractFixture,
} from 'map/findspotTransferContract.testSupport'

interface OutputManifest {
  sites: Record<
    string,
    {
      artifactSourceRevision: string
      artifactManifestSha256: string
      artifactContractRevision: string
    }
  >
  handoffContract: { contractRevision: string; producer: { commit: string } }
}

it('generates reproducible geometry and provenance from the versioned metadata-only contract', () => {
  const directory = makeWorkDir()
  const contract = transferContract(directory)
  runGenerator(directory)
  const manifest = readJson<OutputManifest>(
    path.join(directory, 'manifest.json'),
  )
  expect(manifest.handoffContract.contractRevision).toBe(
    contract.contractRevision,
  )
  expect(manifest.handoffContract.producer.commit).toBe('a'.repeat(40))
  expect(manifest.sites.ASSUR).toMatchObject({
    artifactSourceRevision: contract.sites.ASSUR.sourceRevision,
    artifactManifestSha256: hashFile(
      path.join(directory, 'ARTIFACT_MANIFEST.json'),
    ),
    artifactContractRevision: contract.contractRevision,
  })
  const before = outputHashes(directory)
  const beforeManifest = fs.readFileSync(path.join(directory, 'manifest.json'))
  runGenerator(directory)
  expect(outputHashes(directory)).toEqual(before)
  expect(fs.readFileSync(path.join(directory, 'manifest.json'))).toEqual(
    beforeManifest,
  )
  const revision = contract.contractRevision
  contract.producer.commit = 'b'.repeat(40)
  writeTransferContract(directory, contract)
  expect(contract.contractRevision).toBe(revision)
  runGenerator(directory)
  expect(outputHashes(directory)).toEqual(before)
})

const malformedContracts: readonly [
  string,
  (contract: TransferContractFixture) => void,
][] = [
  [
    'boolean schema',
    (contract) => {
      contract.schemaVersion = true
    },
  ],
  [
    'unsupported version',
    (contract) => {
      contract.contractVersion = 'unsupported'
    },
  ],
  [
    'incompatible geometry',
    (contract) => {
      contract.geometryContractVersion = 'unsupported'
    },
  ],
  [
    'wrong CRS',
    (contract) => {
      contract.canonicalCrs = 'EPSG:3857'
    },
  ],
  [
    'included geometry',
    (contract) => {
      contract.geometryIncluded = true
    },
  ],
  [
    'unknown file path',
    (contract) => {
      contract.fileChecksums['../escape.json'] = '0'.repeat(64)
    },
  ],
  [
    'wrong checksum',
    (contract) => {
      contract.fileChecksums['assur_polygon_inventory.json'] = '0'.repeat(64)
    },
  ],
  [
    'cross-site identity',
    (contract) => {
      contract.sites.KALHU.siteId = 'ASSUR'
    },
  ],
  [
    'wrong site name',
    (contract) => {
      contract.sites.NIPPUR.siteName = 'Unknown site'
    },
  ],
  [
    'wrong revision',
    (contract) => {
      contract.sites.URUK.sourceRevision = 'other-revision'
    },
  ],
  [
    'wrong count',
    (contract) => {
      contract.sites.ASSUR.mappingCount += 1
    },
  ],
  [
    'wrong expectations',
    (contract) => {
      contract.expectations.kalhu.mapped += 1
    },
  ],
  [
    'unknown producer',
    (contract) => {
      contract.producer.repository = 'unknown/repository'
    },
  ],
]

it.each(malformedContracts)(
  'rejects %s before replacing any published output',
  (_label, change) => {
    const directory = makeWorkDir()
    const contract = transferContract(directory)
    runGenerator(directory)
    const before = outputHashes(directory)
    const beforeManifest = fs.readFileSync(
      path.join(directory, 'manifest.json'),
    )
    change(contract)
    writeTransferContract(directory, contract)
    expect(() => runGenerator(directory)).toThrow()
    expect(outputHashes(directory)).toEqual(before)
    expect(fs.readFileSync(path.join(directory, 'manifest.json'))).toEqual(
      beforeManifest,
    )
  },
)

it('rejects a modified content digest without trusting the claimed revision', () => {
  const directory = makeWorkDir()
  transferContract(directory)
  const file = path.join(directory, 'ARTIFACT_MANIFEST.json')
  fs.writeFileSync(
    file,
    fs.readFileSync(file, 'utf8').replace('sha256:', 'sha257:'),
  )
  const before = outputHashes(directory)
  expect(() => runGenerator(directory)).toThrow()
  expect(outputHashes(directory)).toEqual(before)
})

it.each(['contract', 'inventory'])(
  'rejects ambiguous duplicate JSON keys in %s inputs',
  (kind) => {
    const directory = makeWorkDir()
    const contract = transferContract(directory)
    if (kind === 'contract') {
      const file = path.join(directory, 'ARTIFACT_MANIFEST.json')
      fs.writeFileSync(
        file,
        fs
          .readFileSync(file, 'utf8')
          .replace(
            '"schemaVersion":1,',
            '"schemaVersion":1,"schemaVersion":1,',
          ),
      )
    } else {
      const file = artifactPath(directory, 'assur', 'polygon_inventory')
      fs.writeFileSync(
        file,
        fs
          .readFileSync(file, 'utf8')
          .replace(/"polygonId"\s*:\s*"([^"]+)"/, '$&,"polygonId":"$1"'),
      )
      contract.fileChecksums[path.basename(file)] = hashFile(file)
      writeTransferContract(directory, contract)
    }
    const before = outputHashes(directory)
    expect(() => runGenerator(directory)).toThrow()
    expect(outputHashes(directory)).toEqual(before)
  },
)

it.each(['NaN', 'Infinity', '-Infinity', '1e309'])(
  'rejects non-finite JSON %s before publishing invalid geometry files',
  (number) => {
    const directory = makeWorkDir()
    transferContract(directory)
    const file = path.join(directory, 'assur.geojson')
    fs.writeFileSync(
      file,
      fs
        .readFileSync(file, 'utf8')
        .replace(/"name"\s*:\s*"[^"]+"/, `$&,"untrusted":${number}`),
    )
    const before = outputHashes(directory)
    expect(() => runGenerator(directory)).toThrow()
    expect(outputHashes(directory)).toEqual(before)
  },
)
