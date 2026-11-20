import { execFileSync } from 'child_process'
import path from 'path'

it('aligns canonical polygon identities with backend NFKD diacritic normalization', () => {
  const directory = path.resolve(__dirname, '../../../scripts/maps')
  const program = [
    'from findspot_geometry_identity import polygon_id',
    'assert polygon_id("kalhu", "Ekal ma\u0161arti (Fort Shalmaneser)", "abc123") == "kalhu-ekal-masarti-fort-shalmaneser-abc123"',
    'assert polygon_id("assur", "A\u0161\u0161ur", "abc123") == "assur-assur-abc123"',
    'assert polygon_id("assur", "A\u0301rea", "abc123") == polygon_id("assur", "\u00c1rea", "abc123")',
  ].join('\n')
  expect(() =>
    execFileSync('python3', ['-c', program], { cwd: directory }),
  ).not.toThrow()
})
