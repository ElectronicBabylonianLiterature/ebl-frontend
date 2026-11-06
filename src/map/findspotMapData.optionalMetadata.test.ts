import { sanitizeFindspotMapData } from 'map/findspotMapData'
import {
  IncompatibleFindspotMapDataError,
  requireCompatibleFindspotMapDataResponse,
  sanitizeFindspotMapDataResponseWithDiagnostics,
} from 'map/findspotMapDataSanitizer'
import { findspotMapDataDto } from 'test-support/map-fixtures'

const LOCATION_FIELDS = ['sector', 'area', 'building', 'room'] as const
const expected = findspotMapDataDto({
  sector: null,
  area: null,
  building: null,
  room: null,
})
const omitted = Object.fromEntries(
  Object.entries(expected).filter(
    ([key]) => !LOCATION_FIELDS.some((field) => field === key),
  ),
)

it('accepts an otherwise compatible response with all optional metadata omitted', () => {
  expect(sanitizeFindspotMapData(omitted)).toEqual(expected)
  expect(
    requireCompatibleFindspotMapDataResponse(
      { findspots: [omitted] },
      expected.siteId,
      expected.siteName,
    ),
  ).toEqual([expected])
})

it('recognizes omitted and explicit-null metadata as the same duplicate row', () => {
  expect(
    sanitizeFindspotMapDataResponseWithDiagnostics({
      findspots: [omitted, expected],
    }),
  ).toEqual({
    findspots: [expected],
    diagnostics: {
      exactDuplicateRows: 1,
      conflictingDuplicateFindspots: 0,
      conflictingDuplicateRows: 0,
      rejectedRows: 0,
    },
  })
})

it.each(LOCATION_FIELDS)('rejects invalid present %s metadata', (field) => {
  for (const invalid of [42, false, [], {}]) {
    const row = { ...omitted, [field]: invalid }
    expect(sanitizeFindspotMapData(row)).toBeNull()
    expect(() =>
      requireCompatibleFindspotMapDataResponse(
        { findspots: [row] },
        expected.siteId,
        expected.siteName,
      ),
    ).toThrow(IncompatibleFindspotMapDataError)
  }
})
