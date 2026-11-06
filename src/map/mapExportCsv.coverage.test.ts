import { buildExportCsv, CSV_COLUMNS } from 'map/mapExportCsv'
import { toExportRows, type MapExportContext } from 'map/mapExportData'
import { excavationPolygon } from 'test-support/map-fixtures'

const context: MapExportContext = {
  visualization: 'count',
  siteFilter: '',
  shareUrl: 'https://www.ebl.lmu.de/tools/map',
  exportedAt: '2026-11-06T00:00:00.000Z',
  scope: { type: 'selection', polygonId: 'external-area' },
  dataStatuses: {},
}

it('leaves unavailable provenance blank for an unknown site', () => {
  const rows = toExportRows(
    [excavationPolygon({ siteId: 'external', polygonId: 'external-area' })],
    new Map(),
  )
  const values = buildExportCsv(rows, context).split('\r\n')[1].split(',')
  const columns = Object.fromEntries(
    CSV_COLUMNS.map((column, index) => [column, values[index]]),
  )
  expect(columns).toMatchObject({
    siteId: 'external',
    dataStatus: 'not-configured',
    canonicalSiteId: '',
    artifactSourceRevision: '',
    mappingSourceRevisions: '',
    artifactManifestSha256: '',
    polygonGeometrySha256: '',
    artifactContractRevision: '',
  })
})

it.each(['\u007f=1', '\u009f+1', '\u00a0@value', '\u0001-1'])(
  'guards formulas after a leading control character: %j',
  (label) => {
    const rows = toExportRows([excavationPolygon({ name: label })], new Map())
    expect(buildExportCsv(rows, context)).toContain(`'${label}`)
  },
)
