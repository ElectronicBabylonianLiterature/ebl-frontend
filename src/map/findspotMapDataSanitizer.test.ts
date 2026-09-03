import {
  sanitizeFindspotMapDataResponse,
  sanitizeFindspotMapDataResponseWithDiagnostics,
} from 'map/findspotMapDataSanitizer'
import type { FindspotMapData } from 'map/findspotMapData'

function findspot(overrides: Partial<FindspotMapData> = {}): FindspotMapData {
  return {
    findspotId: 1,
    siteId: 'ASSUR',
    siteName: 'Aššur',
    polygonIds: ['assur-area-a-checksum'],
    accessibleFragmentCount: 2,
    locationPrecision: 'excavation-area',
    matchMethod: 'verified-source',
    sector: null,
    area: 'Area A',
    building: null,
    room: null,
    ...overrides,
  }
}

describe('sanitizeFindspotMapDataResponse', () => {
  it('returns empty array for non-object input', () => {
    expect(sanitizeFindspotMapDataResponse(null)).toEqual([])
    expect(sanitizeFindspotMapDataResponse(undefined)).toEqual([])
    expect(sanitizeFindspotMapDataResponse('string')).toEqual([])
    expect(sanitizeFindspotMapDataResponse(42)).toEqual([])
  })

  it('returns empty array when findspots is missing or not an array', () => {
    expect(sanitizeFindspotMapDataResponse({})).toEqual([])
    expect(sanitizeFindspotMapDataResponse({ findspots: 'not-array' })).toEqual(
      [],
    )
  })

  it('rejects non-integer findspotId', () => {
    expect(
      sanitizeFindspotMapDataResponse({
        findspots: [findspot({ findspotId: 1.5 })],
      }),
    ).toEqual([])
  })

  it('rejects negative accessibleFragmentCount', () => {
    expect(
      sanitizeFindspotMapDataResponse({
        findspots: [findspot({ accessibleFragmentCount: -1 })],
      }),
    ).toEqual([])
  })

  it('rejects non-finite accessibleFragmentCount', () => {
    expect(
      sanitizeFindspotMapDataResponse({
        findspots: [
          findspot({ accessibleFragmentCount: Infinity }),
          findspot({ accessibleFragmentCount: NaN }),
        ],
      }),
    ).toEqual([])
  })

  it('rejects empty siteId or siteName', () => {
    expect(
      sanitizeFindspotMapDataResponse({
        findspots: [findspot({ siteId: '' })],
      }),
    ).toEqual([])
    expect(
      sanitizeFindspotMapDataResponse({
        findspots: [findspot({ siteId: '  ' })],
      }),
    ).toEqual([])
    expect(
      sanitizeFindspotMapDataResponse({
        findspots: [findspot({ siteName: '' })],
      }),
    ).toEqual([])
  })

  it('rejects empty polygonIds array', () => {
    expect(
      sanitizeFindspotMapDataResponse({
        findspots: [findspot({ polygonIds: [] })],
      }),
    ).toEqual([])
  })

  it('rejects polygonIds with empty strings', () => {
    expect(
      sanitizeFindspotMapDataResponse({
        findspots: [findspot({ polygonIds: ['valid', ''] })],
      }),
    ).toEqual([])
  })

  it('rejects duplicate polygon IDs within one row', () => {
    expect(
      sanitizeFindspotMapDataResponse({
        findspots: [
          findspot({
            polygonIds: ['assur-area-a-checksum', 'assur-area-a-checksum'],
          }),
        ],
      }),
    ).toEqual([])
  })

  it('rejects unsupported locationPrecision', () => {
    expect(
      sanitizeFindspotMapDataResponse({
        findspots: [findspot({ locationPrecision: 'building' as never })],
      }),
    ).toEqual([])
  })

  it('rejects unsupported matchMethod', () => {
    expect(
      sanitizeFindspotMapDataResponse({
        findspots: [findspot({ matchMethod: 'unknown' as never })],
      }),
    ).toEqual([])
  })

  it('accepts verified-source matchMethod', () => {
    expect(
      sanitizeFindspotMapDataResponse({
        findspots: [findspot({ matchMethod: 'verified-source' })],
      }),
    ).toHaveLength(1)
  })

  it('accepts zero accessibleFragmentCount', () => {
    expect(
      sanitizeFindspotMapDataResponse({
        findspots: [findspot({ accessibleFragmentCount: 0 })],
      }),
    ).toHaveLength(1)
  })

  it('rejects conflicting duplicate findspots with different polygonIds', () => {
    expect(
      sanitizeFindspotMapDataResponse({
        findspots: [
          findspot({ findspotId: 7, polygonIds: ['assur-a-checksum'] }),
          findspot({ findspotId: 7, polygonIds: ['assur-b-checksum'] }),
        ],
      }),
    ).toEqual([])
  })

  it('keeps valid rows and ignores malformed rows', () => {
    expect(
      sanitizeFindspotMapDataResponse({
        findspots: [
          findspot({ accessibleFragmentCount: 0 }),
          findspot({ findspotId: 2, polygonIds: [] }),
          findspot({ findspotId: 3, locationPrecision: 'site' as never }),
        ],
      }),
    ).toEqual([findspot({ accessibleFragmentCount: 0 })])
  })

  it('deduplicates exact duplicate findspot rows', () => {
    expect(
      sanitizeFindspotMapDataResponse({
        findspots: [findspot({ findspotId: 7 }), findspot({ findspotId: 7 })],
      }),
    ).toEqual([findspot({ findspotId: 7 })])
  })

  it('reports duplicate diagnostics without exposing row content', () => {
    expect(
      sanitizeFindspotMapDataResponseWithDiagnostics({
        findspots: [
          findspot({ findspotId: 7 }),
          findspot({ findspotId: 7 }),
          findspot({ findspotId: 8, polygonIds: ['assur-a-checksum'] }),
          findspot({ findspotId: 8, polygonIds: ['assur-b-checksum'] }),
        ],
      }),
    ).toMatchObject({
      findspots: [findspot({ findspotId: 7 })],
      diagnostics: {
        exactDuplicateRows: 1,
        conflictingDuplicateFindspots: 1,
        conflictingDuplicateRows: 2,
      },
    })
  })

  it('does not let later duplicate records override earlier records', () => {
    expect(
      sanitizeFindspotMapDataResponse({
        findspots: [
          findspot({ findspotId: 7 }),
          findspot({
            findspotId: 7,
            polygonIds: ['assur-area-b-checksum'],
            accessibleFragmentCount: 99,
          }),
        ],
      }),
    ).toEqual([])
  })

  it('returns the same result when conflicting duplicates are reordered', () => {
    const left = sanitizeFindspotMapDataResponse({
      findspots: [
        findspot({ findspotId: 7, polygonIds: ['assur-a-checksum'] }),
        findspot({ findspotId: 7, polygonIds: ['assur-b-checksum'] }),
        findspot({ findspotId: 8 }),
      ],
    })
    const right = sanitizeFindspotMapDataResponse({
      findspots: [
        findspot({ findspotId: 8 }),
        findspot({ findspotId: 7, polygonIds: ['assur-b-checksum'] }),
        findspot({ findspotId: 7, polygonIds: ['assur-a-checksum'] }),
      ],
    })

    expect(left).toEqual([findspot({ findspotId: 8 })])
    expect(right).toEqual(left)
  })
})
