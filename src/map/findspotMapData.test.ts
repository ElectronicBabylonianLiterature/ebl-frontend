import { sanitizeFindspotMapData } from 'map/findspotMapData'
import { findspotMapDataDto } from 'test-support/map-fixtures'

it.each([null, undefined, 42, 'not an object'])(
  'rejects non-object map rows %p',
  (value) => expect(sanitizeFindspotMapData(value)).toBeNull(),
)

it.each([
  { findspotId: '1' },
  { siteId: null },
  { polygonIds: null },
  { polygonIds: ['valid', 1] },
  { sector: undefined },
  { area: undefined },
  { building: undefined },
  { room: undefined },
  { sector: 42 },
])('rejects malformed required fields %j', (fields) => {
  expect(
    sanitizeFindspotMapData({ ...findspotMapDataDto(), ...fields }),
  ).toBeNull()
})

it('preserves nullable location fields and strips unknown response fields', () => {
  const expected = findspotMapDataDto({
    matchMethod: 'curated',
    sector: '',
    area: null,
    building: 'Building A',
    room: null,
  })

  expect(
    sanitizeFindspotMapData({ ...expected, privateNotes: 'hidden' }),
  ).toEqual(expected)
})
