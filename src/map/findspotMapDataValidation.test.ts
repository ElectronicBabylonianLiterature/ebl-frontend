import { sanitizeFindspotMapData } from 'map/findspotMapDataValidation'

const validFindspot = {
  findspotId: 1,
  siteId: 'ASSUR',
  siteName: 'Aššur',
  polygonIds: ['assur-area'],
  accessibleFragmentCount: 0,
  locationPrecision: 'excavation-area',
  matchMethod: 'verified-source',
  sector: null,
  area: null,
  building: null,
  room: null,
}

it.each(['findspotId', 'accessibleFragmentCount'])(
  'rejects unsafe, negative and fractional %s values',
  (field) => {
    for (const value of [-1, 1.5, Number.MAX_SAFE_INTEGER + 1, NaN, Infinity]) {
      expect(
        sanitizeFindspotMapData({ ...validFindspot, [field]: value }),
      ).toBeNull()
    }
  },
)

it('retains zero counts and safe integer identifiers', () => {
  const record = { ...validFindspot, findspotId: Number.MAX_SAFE_INTEGER }
  expect(sanitizeFindspotMapData(record)).toEqual(record)
})
