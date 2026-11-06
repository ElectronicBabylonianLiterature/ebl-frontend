import { execFileSync } from 'child_process'
import path from 'path'
import {
  artifactPath,
  hashFile,
  makeWorkDir,
  root,
  writeJson,
} from 'map/findspotGeneratorTestSupport'

function checkCopiedHandoff(directory: string): void {
  const program = `
from pathlib import Path
import subprocess
import sys
sys.path.insert(0, sys.argv[1])
from test_findspot_map_handoff import FindspotMapHandoffTest, SCRIPT
source = Path(sys.argv[2])
case = FindspotMapHandoffTest()
case.artifact_source = source
case.geometry_source = source
try:
    case.setUp()
    manifest = "assur_artifact_manifest.json"
    assert (case.artifacts / manifest).read_bytes() == (source / manifest).read_bytes()
    result = subprocess.run([
        sys.executable, str(SCRIPT),
        "--artifact-dir", str(case.artifacts),
        "--findspot-dir", str(case.geometry),
        "--expectations", str(source / "expectations.json"),
    ], check=False, capture_output=True, text=True)
    if result.returncode:
        raise RuntimeError(result.stderr)
finally:
    case.doCleanups()
`
  execFileSync(
    'python3',
    ['-c', program, path.join(root, 'scripts', 'maps'), directory],
    { stdio: 'pipe' },
  )
}

function suppliedManifest(directory: string): {
  schemaVersion: number
  sourceRevision: string
  files: Record<string, string>
} {
  return {
    schemaVersion: 1,
    sourceRevision: 'reviewed-handoff',
    files: Object.fromEntries(
      ['polygon_inventory', 'findspot_polygon_mappings'].map((suffix) => {
        const file = artifactPath(directory, 'assur', suffix)
        return [path.basename(file), hashFile(file)]
      }),
    ),
  }
}

test('preserves and validates a supplied manifest in the copied handoff', () => {
  const directory = makeWorkDir()
  writeJson(
    artifactPath(directory, 'assur', 'artifact_manifest'),
    suppliedManifest(directory),
  )
  expect(() => checkCopiedHandoff(directory)).not.toThrow()
})

test.each(['version', 'checksum'])(
  'rejects an incompatible supplied manifest %s in the copied handoff',
  (invalidField) => {
    const directory = makeWorkDir()
    const manifest = suppliedManifest(directory)
    if (invalidField === 'version') manifest.schemaVersion = 2
    else {
      manifest.files['assur_polygon_inventory.json'] = 'invalid-checksum'
    }
    writeJson(artifactPath(directory, 'assur', 'artifact_manifest'), manifest)
    expect(() => checkCopiedHandoff(directory)).toThrow(
      invalidField === 'version'
        ? /artifact manifest is invalid/
        : /artifact manifest checksum disagrees/,
    )
  },
)
