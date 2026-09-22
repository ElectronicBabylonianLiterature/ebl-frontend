import {
  IncompatibleFindspotMapDataError,
  requireCompatibleFindspotMapDataResponse,
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

  it.each([1.5, Number.MAX_SAFE_INTEGER + 1])(
    'rejects unsafe findspotId %s',
    (findspotId) => {
      expect(
        sanitizeFindspotMapDataResponse({
          findspots: [findspot({ findspotId })],
        }),
      ).toEqual([])
    },
  )

  it('rejects negative findspotId while retaining zero', () => {
    expect(
      sanitizeFindspotMapDataResponse({
        findspots: [findspot({ findspotId: -1 }), findspot({ findspotId: 0 })],
      }),
    ).toEqual([findspot({ findspotId: 0 })])
  })

  it('requires the exact requested site id', () => {
    const response = { findspots: [findspot({ siteId: 'ASSUR' })] }

    expect(sanitizeFindspotMapDataResponse(response, 'ASSUR')).toHaveLength(1)
    expect(sanitizeFindspotMapDataResponse(response, 'KALHU')).toEqual([])
    expect(sanitizeFindspotMapDataResponse(response, 'assur')).toEqual([])
  })

  it.each([-1, 1.5, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1])(
    'rejects invalid accessibleFragmentCount %s',
    (accessibleFragmentCount) => {
      expect(
        sanitizeFindspotMapDataResponse({
          findspots: [findspot({ accessibleFragmentCount })],
        }),
      ).toEqual([])
    },
  )

  it.each([{ siteId: '' }, { siteId: '  ' }, { siteName: '' }] as const)(
    'rejects empty site metadata %#',
    (overrides) => {
      expect(
        sanitizeFindspotMapDataResponse({
          findspots: [findspot(overrides)],
        }),
      ).toEqual([])
    },
  )

  it.each([
    { polygonIds: [] },
    { polygonIds: ['valid', ''] },
    { polygonIds: ['duplicate', 'duplicate'] },
    { locationPrecision: 'building' as never },
    { matchMethod: 'unknown' as never },
  ])('rejects malformed row fields %#', (overrides) => {
    expect(
      sanitizeFindspotMapDataResponse({ findspots: [findspot(overrides)] }),
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

describe('requireCompatibleFindspotMapDataResponse', () => {
  const requireAssur = (response: unknown): readonly FindspotMapData[] =>
    requireCompatibleFindspotMapDataResponse(response, 'ASSUR', 'Aššur')

  it.each([
    null,
    {},
    { findspots: 'not-array' },
    { findspots: [findspot({ polygonIds: [] })] },
    {
      findspots: [findspot(), findspot({ findspotId: 2, polygonIds: [] })],
    },
    { findspots: [findspot({ siteName: 'Assur' })] },
    {
      findspots: [
        findspot({ findspotId: 7, polygonIds: ['assur-a'] }),
        findspot({ findspotId: 7, polygonIds: ['assur-b'] }),
      ],
    },
    { findspots: [findspot({ accessibleFragmentCount: 1.5 })] },
    {
      findspots: [
        findspot({ accessibleFragmentCount: Number.MAX_SAFE_INTEGER + 1 }),
      ],
    },
  ])('rejects incompatible response %#', (response) => {
    expect(() => requireAssur(response)).toThrow(
      IncompatibleFindspotMapDataError,
    )
  })

  it('accepts legitimate empty and zero-count responses', () => {
    expect(requireAssur({ findspots: [] })).toEqual([])
    expect(
      requireAssur({
        findspots: [findspot({ accessibleFragmentCount: 0 })],
      }),
    ).toEqual([findspot({ accessibleFragmentCount: 0 })])
  })
})
