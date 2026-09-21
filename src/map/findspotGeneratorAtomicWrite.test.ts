import { execFileSync } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'

import { generator, root } from 'map/findspotGeneratorTestSupport'

test('rolls back every replaced output when a later replace fails', () => {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'map-output-rollback-'),
  )
  for (const name of ['assur', 'kalhu', 'all']) {
    fs.writeFileSync(path.join(directory, `${name}.geojson`), `old-${name}`)
  }
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
replace_count = 0

def fail_second_replace(source, target):
    global replace_count
    replace_count += 1
    if replace_count == 2:
        raise OSError("injected replace failure")
    return real_replace(source, target)

try:
    with patch.object(Path, "replace", fail_second_replace):
        module.atomic_write_outputs(
            directory,
            {"assur": {"type": "FeatureCollection", "features": []},
             "kalhu": {"type": "FeatureCollection", "features": []}},
            {"type": "FeatureCollection", "features": []},
        )
except OSError:
    pass
else:
    raise AssertionError("replace failure was not raised")
`

  execFileSync('python3', ['-c', program, generator, directory])

  for (const name of ['assur', 'kalhu', 'all']) {
    expect(
      fs.readFileSync(path.join(directory, `${name}.geojson`), 'utf8'),
    ).toBe(`old-${name}`)
  }
})

test('keeps the default artifact workspace ignored', () => {
  expect(() =>
    execFileSync(
      'git',
      ['check-ignore', '-q', '.map-processing/backend-artifacts/example.json'],
      { cwd: root },
    ),
  ).not.toThrow()
})
