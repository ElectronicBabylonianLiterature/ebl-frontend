import {
  DEFAULT_MAP_URL_STATE,
  MAP_URL_STATE_VERSION,
  parseMapUrlState,
  serializeMapUrlState,
  type MapUrlState,
} from 'map/mapUrlState'

describe('map URL state', () => {
  it('returns defaults when the version is absent or unknown', () => {
    expect(parseMapUrlState('')).toEqual(DEFAULT_MAP_URL_STATE)
    expect(parseMapUrlState('?mv=99&findspot=x')).toEqual(DEFAULT_MAP_URL_STATE)
  })

  it('round-trips a fully populated state', () => {
    const state: MapUrlState = {
      version: MAP_URL_STATE_VERSION,
      filter: 'Aššur',
      showExcavationAreas: true,
      selection: { type: 'excavation-area', polygonId: 'assur-area-a' },
      visualization: 'count',
      terrain: true,
    }

    expect(parseMapUrlState(serializeMapUrlState(state))).toEqual(state)
  })

  it('omits empty fields from the query string', () => {
    expect(serializeMapUrlState(DEFAULT_MAP_URL_STATE)).toBe(
      `mv=${MAP_URL_STATE_VERSION}`,
    )
  })
})
