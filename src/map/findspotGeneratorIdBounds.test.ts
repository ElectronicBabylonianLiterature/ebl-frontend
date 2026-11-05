import fs from 'fs'
import {
  artifactPath,
  makeWorkDir,
  outputHashes,
  runGenerator,
} from 'map/findspotGeneratorTestSupport'

function setFindspotId(directory: string, value: string): void {
  const file = artifactPath(directory, 'kalhu', 'findspot_polygon_mappings')
  fs.writeFileSync(
    file,
    fs
      .readFileSync(file, 'utf8')
      .replace(/"findspotId":\s*\d+/, `"findspotId": ${value}`),
  )
}

it('accepts the backend maximum BSON int64 findspot identifier exactly', () => {
  const directory = makeWorkDir()
  setFindspotId(directory, '9223372036854775807')

  expect(() => runGenerator(directory)).not.toThrow()
})

it.each(['9223372036854775808', '18446744073709551616'])(
  'rejects the out-of-range findspot identifier %s before replacing outputs',
  (value) => {
    const directory = makeWorkDir()
    setFindspotId(directory, value)
    const before = outputHashes(directory)

    expect(() => runGenerator(directory)).toThrow()
    expect(outputHashes(directory)).toEqual(before)
  },
)
