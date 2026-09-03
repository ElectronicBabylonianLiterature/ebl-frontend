import {
  excavationPolygon,
  findspotMapDataDto as findspotMapData,
} from 'test-support/map-fixtures'
import { aggregateFindspotMapData } from 'map/findspotMapDataSanitizer'
import {
  CSV_COLUMNS,
  type MapExportContext,
  buildExportCsv,
  buildExportGeoJson,
  toExportRows,
} from './mapExportData'

const CONTEXT: MapExportContext = {
  visualization: 'count',
  siteFilter: 'Aššur',
  shareUrl: 'https://www.ebl.lmu.de/map?v=1',
  exportedAt: '2026-08-05T12:00:00.000Z',
}

const POLYGONS = [
  excavationPolygon({ polygonId: 'assur-b', name: 'Area B' }),
  excavationPolygon({ polygonId: 'assur-a', name: 'Area A' }),
]

const SUMMARIES = aggregateFindspotMapData([
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
])

describe('toExportRows', () => {
  it('orders rows by canonical id and carries mapped counts', () => {
    const rows = toExportRows(POLYGONS, SUMMARIES)

    expect(rows.map((row) => row.polygonId)).toEqual(['assur-a', 'assur-b'])
    expect(rows[0]).toMatchObject({
      label: 'Area A',
      mappedFindspotIds: [3, 5],
      mappedFindspotCount: 2,
      accessibleFragmentCount: 5,
      locationPrecision: 'excavation-area',
      matchMethod: 'curated|verified-source',
    })
  })

  it('marks an unmapped polygon rather than inventing a precision', () => {
    expect(toExportRows(POLYGONS, SUMMARIES)[1]).toMatchObject({
      mappedFindspotIds: [],
      mappedFindspotCount: 0,
      accessibleFragmentCount: 0,
      locationPrecision: 'not-mapped',
      matchMethod: 'not-mapped',
    })
  })

  it('falls back to the canonical id when a polygon has no label', () => {
    expect(
      toExportRows(
        [excavationPolygon({ polygonId: 'assur-c', name: null })],
        SUMMARIES,
      )[0].label,
    ).toBe('assur-c')
  })
})

describe('buildExportGeoJson', () => {
  it('emits EPSG:4326 features with the excavation-area caveat', () => {
    const collection = buildExportGeoJson(
      toExportRows(POLYGONS, SUMMARIES),
      CONTEXT,
    )

    expect(collection.type).toBe('FeatureCollection')
    expect(collection.features).toHaveLength(2)
    expect(collection.metadata).toMatchObject({
      crs: 'EPSG:4326',
      visualization: 'count',
      siteFilter: 'Aššur',
      shareUrl: CONTEXT.shareUrl,
      exportedAt: CONTEXT.exportedAt,
    })
    expect(collection.metadata.note).toContain(
      'not an exact findspot coordinate',
    )
  })

  it('keeps polygon geometry and canonical identity on each feature', () => {
    const [feature] = buildExportGeoJson(
      toExportRows(POLYGONS, SUMMARIES),
      CONTEXT,
    ).features

    expect(feature.id).toBe('assur-a')
    expect(feature.geometry.type).toBe('Polygon')
    expect(feature.properties).toMatchObject({
      polygonId: 'assur-a',
      siteId: 'assur',
      mappedFindspotIds: [3, 5],
    })
  })
})

describe('buildExportCsv', () => {
  it('starts with the declared header row', () => {
    const csv = buildExportCsv(toExportRows(POLYGONS, SUMMARIES), CONTEXT)

    expect(csv.split('\r\n')[0]).toBe(CSV_COLUMNS.join(','))
    expect(csv.split('\r\n')).toHaveLength(3)
  })

  it('writes counts, filters and the share url on each row', () => {
    const [, row] = buildExportCsv(
      toExportRows(POLYGONS, SUMMARIES),
      CONTEXT,
    ).split('\r\n')

    expect(row).toContain('assur-a')
    expect(row).toContain('3 5')
    expect(row).toContain('count')
    expect(row).toContain(CONTEXT.shareUrl)
  })

  it('leaves the area column empty when no geodesic area exists', () => {
    const csv = buildExportCsv(
      toExportRows(
        [excavationPolygon({ polygonId: 'assur-a', areaSquareKm: null })],
        new Map(),
      ),
      CONTEXT,
    )

    expect(csv.split('\r\n')[1]).toContain(',,not-mapped')
  })

  it('quotes values containing separators or quotes', () => {
    const csv = buildExportCsv(
      toExportRows(
        [excavationPolygon({ polygonId: 'assur-a', name: 'Area "A", north' })],
        new Map(),
      ),
      CONTEXT,
    )

    expect(csv).toContain('"Area ""A"", north"')
  })

  it('quotes a label containing a newline', () => {
    const csv = buildExportCsv(
      toExportRows(
        [excavationPolygon({ polygonId: 'assur-a', name: 'Area\nA' })],
        new Map(),
      ),
      CONTEXT,
    )

    expect(csv).toContain('"Area\nA"')
  })

  it.each(['=cmd()', '+1', '-1', '@ref', '\tlead'])(
    'neutralises the spreadsheet formula prefix in %s',
    (name) => {
      const csv = buildExportCsv(
        toExportRows(
          [excavationPolygon({ polygonId: 'assur-a', name })],
          new Map(),
        ),
        CONTEXT,
      )

      expect(csv).toContain(`'${name.replace(/\t/, '\t')}`)
    },
  )
})
