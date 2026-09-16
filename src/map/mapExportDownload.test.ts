import { saveAs } from 'file-saver'
import { excavationPolygon } from 'test-support/map-fixtures'
import { type MapExportContext, toExportRows } from './mapExportData'
import {
  CSV_MEDIA_TYPE,
  GEOJSON_MEDIA_TYPE,
  downloadExportCsv,
  downloadExportGeoJson,
  exportFileName,
} from './mapExportDownload'

jest.mock('file-saver', () => ({ saveAs: jest.fn() }))

const CONTEXT: MapExportContext = {
  visualization: 'mapped',
  siteFilter: '',
  shareUrl: 'https://www.ebl.lmu.de/map?v=1',
  exportedAt: '2026-08-05T12:00:00.000Z',
}

const ROWS = toExportRows([excavationPolygon()], new Map())

beforeEach(() => jest.clearAllMocks())

function readBlob(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsText(blob)
  })
}

async function savedBlob(): Promise<{ text: string; name: string }> {
  const [blob, name] = (saveAs as jest.Mock).mock.calls[0] as [Blob, string]
  return { text: await readBlob(blob), name }
}

describe('exportFileName', () => {
  it('makes the timestamp safe for a filename', () => {
    expect(exportFileName('geojson', CONTEXT.exportedAt)).toBe(
      'ebl-map-2026-08-05T12-00-00-000Z.geojson',
    )
  })
})

describe('downloadExportGeoJson', () => {
  it('saves a geo+json blob under a timestamped name', async () => {
    downloadExportGeoJson(ROWS, CONTEXT)

    const { text, name } = await savedBlob()
    expect(name).toBe('ebl-map-2026-08-05T12-00-00-000Z.geojson')
    expect((saveAs as jest.Mock).mock.calls[0][0].type).toBe(GEOJSON_MEDIA_TYPE)
    expect(JSON.parse(text)).toMatchObject({
      type: 'FeatureCollection',
      metadata: { crs: 'EPSG:4326', shareUrl: CONTEXT.shareUrl },
    })
  })
})

describe('downloadExportCsv', () => {
  it('saves a csv blob under a timestamped name', async () => {
    downloadExportCsv(ROWS, CONTEXT)

    const { text, name } = await savedBlob()
    expect(name).toBe('ebl-map-2026-08-05T12-00-00-000Z.csv')
    expect((saveAs as jest.Mock).mock.calls[0][0].type).toBe(CSV_MEDIA_TYPE)
    expect(text).toContain('assur-area-a-checksum')
  })
})
