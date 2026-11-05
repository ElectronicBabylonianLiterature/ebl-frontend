import { execFileSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import {
  artifactPath,
  hashFile,
  makeWorkDir,
  outputHashes,
  outputNames,
  readJson,
  runGenerator,
  sites,
  writeJson,
  generator,
} from 'map/findspotGeneratorTestSupport'

interface Manifest {
  schemaVersion: number
  algorithm: string
  files: Record<string, string>
  sites: Record<
    string,
    {
      polygonCount: number
      mappingCount: number
      mappedPolygonCount: number
      mappingSourceRevisions: string[]
      artifactSourceRevision: string | null
      artifactManifestSha256: string | null
    }
  >
}

function manifestPath(directory: string): string {
  return path.join(directory, 'manifest.json')
}

test('records actual output hashes, canonical counts and mapping provenance', () => {
  const directory = makeWorkDir()
  runGenerator(directory)
  const manifest = readJson<Manifest>(manifestPath(directory))
  expect(manifest.schemaVersion).toBe(1)
  expect(manifest.algorithm).toBe('sha256')
  for (const name of outputNames) {
    expect(manifest.files[`${name}.geojson`]).toBe(
      hashFile(path.join(directory, `${name}.geojson`)),
    )
  }
  for (const site of sites) {
    const mappings = readJson<{ sourceRevision: string }[]>(
      artifactPath(directory, site, 'findspot_polygon_mappings'),
    )
    expect(manifest.sites[site.toUpperCase()].mappingCount).toBe(
      mappings.length,
    )
    expect(manifest.sites[site.toUpperCase()].mappingSourceRevisions).toEqual(
      [...new Set(mappings.map(({ sourceRevision }) => sourceRevision))].sort(),
    )
    expect(manifest.sites[site.toUpperCase()].artifactSourceRevision).toBeNull()
  }
  const before = fs.readFileSync(manifestPath(directory))
  runGenerator(directory)
  expect(fs.readFileSync(manifestPath(directory))).toEqual(before)
})

test('verifies supplied backend manifest revisions before publishing any output', () => {
  const directory = makeWorkDir()
  const inputManifest = artifactPath(directory, 'assur', 'artifact_manifest')
  const files = Object.fromEntries(
    ['polygon_inventory', 'findspot_polygon_mappings'].map((suffix) => {
      const file = artifactPath(directory, 'assur', suffix)
      return [path.basename(file), hashFile(file)]
    }),
  )
  writeJson(inputManifest, {
    schemaVersion: 1,
    sourceRevision: 'reviewed-r1',
    files,
  })
  runGenerator(directory)
  const manifest = readJson<Manifest>(manifestPath(directory))
  expect(manifest.sites.ASSUR.artifactSourceRevision).toBe('reviewed-r1')
  expect(manifest.sites.ASSUR.artifactManifestSha256).toBe(
    hashFile(inputManifest),
  )
  const before = outputHashes(directory)
  const manifestBefore = fs.readFileSync(manifestPath(directory))
  writeJson(inputManifest, {
    schemaVersion: 1,
    sourceRevision: 'unverified-r2',
    files: {},
  })
  expect(() => runGenerator(directory)).toThrow()
  expect(outputHashes(directory)).toEqual(before)
  expect(fs.readFileSync(manifestPath(directory))).toEqual(manifestBefore)
})

test('rolls back geometry when publishing the provenance manifest fails', () => {
  const directory = makeWorkDir()
  runGenerator(directory)
  const before = outputHashes(directory)
  const manifestBefore = fs.readFileSync(manifestPath(directory))
  const program = `
import importlib.util
from pathlib import Path
from unittest.mock import patch
import sys
module_path = Path(sys.argv[1])
sys.path.insert(0, str(module_path.parent))
spec = importlib.util.spec_from_file_location("map_generator", module_path)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
directory = Path(sys.argv[2])
real_replace = Path.replace
def fail_manifest(source, target):
    if Path(target).name == "manifest.json":
        raise OSError("injected manifest publication failure")
    return real_replace(source, target)
try:
    with patch.object(Path, "replace", fail_manifest):
        module.atomic_write_outputs(directory, {"assur": {"changed": True}}, {}, {})
except OSError:
    pass
else:
    raise AssertionError("expected publication failure")
`
  execFileSync('python3', ['-c', program, generator, directory])
  expect(outputHashes(directory)).toEqual(before)
  expect(fs.readFileSync(manifestPath(directory))).toEqual(manifestBefore)
})
