import { aggregateFindspotMapData } from 'map/findspotMapDataSanitizer'
import {
  CSV_COLUMNS,
  type MapExportContext,
  buildExportCsv,
  buildExportGeoJson,
  exportDataStatuses,
  toExportRows,
} from 'map/mapExportData'
import type {
  FragmentMapDataState,
  FragmentMapDataStatus,
  SiteFragmentMapDataState,
} from 'map/useFragmentMapData'
import {
  excavationPolygon,
  findspotMapDataDto as findspotMapData,
} from 'test-support/map-fixtures'

const CONTEXT: MapExportContext = {
  visualization: 'count',
  siteFilter: 'Aššur',
  shareUrl: 'https://www.ebl.lmu.de/map?v=1',
  exportedAt: '2026-08-05T12:00:00.000Z',
  scope: { type: 'viewport', bounds: [[43, 35, 44, 36]] },
  dataStatuses: { assur: 'loaded-with-mappings' },
}

const POLYGONS = [
  excavationPolygon({ polygonId: 'assur-b', name: 'Area B' }),
  excavationPolygon({ polygonId: 'assur-a', name: 'Area A' }),
]

const FINDSPOTS = [
  findspotMapData({
    findspotId: 5,
    polygonIds: ['assur-a'],
    accessibleFragmentCount: 4,
    matchMethod: 'curated',
  }),
  findspotMapData({
    findspotId: 3,
    polygonIds: ['assur-a'],
    accessibleFragmentCount: 1,
    matchMethod: 'verified-source',
  }),
]

function siteState(
  status: FragmentMapDataStatus,
  findspots = FINDSPOTS,
): SiteFragmentMapDataState {
  const loaded = status === 'loaded-with-mappings'
  return {
    status,
    findspots: loaded ? findspots : [],
    polygonSummaries: aggregateFindspotMapData(loaded ? findspots : []),
  }
}

function sites(
  status: FragmentMapDataStatus = 'loaded-with-mappings',
): FragmentMapDataState['sites'] {
  return new Map([['assur', siteState(status)]])
}

describe('toExportRows', () => {
  it('orders rows by canonical id and carries loaded mapped counts', () => {
    const rows = toExportRows(POLYGONS, sites())

    expect(rows.map((row) => row.polygonId)).toEqual(['assur-a', 'assur-b'])
    expect(rows[0]).toMatchObject({
      dataStatus: 'loaded-with-mappings',
      mappedFindspotIds: [3, 5],
      mappedFindspotCount: 2,
      accessibleFragmentCount: 5,
      locationPrecision: 'excavation-area',
      matchMethod: 'curated|verified-source',
    })
  })

  it('reports truthful zeroes for a successfully loaded empty site', () => {
    expect(toExportRows(POLYGONS, sites('loaded-empty'))[0]).toMatchObject({
      dataStatus: 'loaded-empty',
      mappedFindspotIds: [],
      mappedFindspotCount: 0,
      accessibleFragmentCount: 0,
      locationPrecision: 'not-mapped',
      matchMethod: 'not-mapped',
    })
  })

  it.each(['loading', 'error', 'incompatible', 'not-configured'] as const)(
    'leaves linked data blank when site data is %s',
    (status) => {
      expect(toExportRows(POLYGONS, sites(status))[0]).toMatchObject({
        dataStatus: status,
        mappedFindspotIds: null,
        mappedFindspotCount: null,
        accessibleFragmentCount: null,
        locationPrecision: null,
        matchMethod: null,
      })
    },
  )

  it('falls back to canonical identity for unknown sites and labels', () => {
    const row = toExportRows(
      [
        excavationPolygon({
          polygonId: 'unknown-c',
          siteId: 'unknown',
          name: null,
        }),
      ],
      sites(),
    )[0]

    expect(row).toMatchObject({
      label: 'unknown-c',
      dataStatus: 'not-configured',
      mappedFindspotCount: null,
    })
  })
})

describe('exportDataStatuses', () => {
  it('captures each site status for reproducibility metadata', () => {
    const states = new Map([
      ['assur', siteState('loaded-empty')],
      ['uruk', siteState('error')],
    ]) as FragmentMapDataState['sites']

    expect(exportDataStatuses(states)).toEqual({
      assur: 'loaded-empty',
      uruk: 'error',
    })
  })
})

describe('buildExportGeoJson', () => {
  it('emits geometry, scope, access caveat, and data statuses', () => {
    const collection = buildExportGeoJson(
      toExportRows(POLYGONS, sites()),
      CONTEXT,
    )

    expect(collection.features).toHaveLength(2)
    expect(collection.metadata).toMatchObject({
      crs: 'EPSG:4326',
      polygonSource: expect.stringContaining('.geojson'),
      scope: CONTEXT.scope,
      dataStatuses: CONTEXT.dataStatuses,
    })
    expect(collection.metadata.note).toContain(
      'not an exact findspot coordinate',
    )
    expect(collection.metadata.accessNote).toContain('caller-authorized')
    expect(collection.features[0]).toMatchObject({
      id: 'assur-a',
      geometry: { type: 'Polygon' },
      properties: {
        polygonId: 'assur-a',
        siteId: 'assur',
        mappedFindspotIds: [3, 5],
      },
    })
  })
})

describe('buildExportCsv', () => {
  it('includes scope, data status, filter, and share metadata per row', () => {
    const csv = buildExportCsv(toExportRows(POLYGONS, sites()), CONTEXT)
    const [header, row] = csv.split('\r\n')

    expect(header).toBe(CSV_COLUMNS.join(','))
    expect(csv.split('\r\n')).toHaveLength(3)
    expect(row).toContain('loaded-with-mappings')
    expect(row).toContain('viewport')
    expect(row).toContain('3 5')
    expect(row).toContain(CONTEXT.shareUrl)
  })

  it('leaves unavailable linked-data columns empty', () => {
    const csv = buildExportCsv(
      toExportRows(
        [excavationPolygon({ polygonId: 'assur-a', areaSquareKm: null })],
        sites('error'),
      ),
      { ...CONTEXT, scope: { type: 'selection', polygonId: 'assur-a' } },
    )
    const values = csv.split('\r\n')[1].split(',')

    expect(values[3]).toBe('error')
    expect(values.slice(4, 10)).toEqual(['', '', '', '', '', ''])
    expect(values).toContain('selection')
    expect(values).toContain('assur-a')
  })

  it('quotes separators, quotes, and newlines', () => {
    const csv = buildExportCsv(
      toExportRows(
        [excavationPolygon({ name: 'Area "A",\nnorth' })],
        sites('loaded-empty'),
      ),
      CONTEXT,
    )

    expect(csv).toContain('"Area ""A"",\nnorth"')
  })

  it.each(['=cmd()', '  +1', '\t-1', '\u00a0@ref', '\n=next'])(
    'neutralises spreadsheet formula input %j after leading whitespace',
    (name) => {
      const csv = buildExportCsv(
        toExportRows([excavationPolygon({ name })], sites('loaded-empty')),
        CONTEXT,
      )

      expect(csv).toContain(`'${name}`)
    },
  )
})
