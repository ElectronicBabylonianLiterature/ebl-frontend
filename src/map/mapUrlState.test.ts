import {
  DEFAULT_MAP_URL_STATE,
  MAX_FILTER_LENGTH,
  parseMapUrlState,
  serializeMapUrlState,
} from 'map/mapUrlState'

describe('parseMapUrlState', () => {
  it('returns the default state for an empty search string', () => {
    expect(parseMapUrlState('')).toEqual(DEFAULT_MAP_URL_STATE)
  })

  it('parses a filter from a versioned search string', () => {
    expect(parseMapUrlState('mv=1&findspot=Babylon')).toEqual({
      version: 1,
      filter: 'Babylon',
    })
  })

  it('falls back to the default state when the version is missing', () => {
    expect(parseMapUrlState('findspot=Babylon')).toEqual(DEFAULT_MAP_URL_STATE)
  })

  it('falls back to the default state when the version does not match', () => {
    expect(parseMapUrlState('mv=2&findspot=Babylon')).toEqual(
      DEFAULT_MAP_URL_STATE,
    )
  })

  it('falls back to the default state when the version is not numeric', () => {
    expect(parseMapUrlState('mv=abc&findspot=Babylon')).toEqual(
      DEFAULT_MAP_URL_STATE,
    )
  })

  it('uses the first value when the filter param is duplicated', () => {
    expect(parseMapUrlState('mv=1&findspot=a&findspot=b')).toEqual({
      version: 1,
      filter: 'a',
    })
  })

  it('treats a present but empty filter as the empty string', () => {
    expect(parseMapUrlState('mv=1')).toEqual(DEFAULT_MAP_URL_STATE)
  })

  it('caps an overlong filter value', () => {
    const overlong = 'a'.repeat(MAX_FILTER_LENGTH + 50)
    const state = parseMapUrlState(`mv=1&findspot=${overlong}`)
    expect(state.filter).toHaveLength(MAX_FILTER_LENGTH)
    expect(state.filter).toBe('a'.repeat(MAX_FILTER_LENGTH))
  })
})

describe('serializeMapUrlState', () => {
  it('serializes to an empty string when the filter is empty', () => {
    expect(serializeMapUrlState(DEFAULT_MAP_URL_STATE)).toBe('')
  })

  it('includes the version and filter when a filter is set', () => {
    const search = serializeMapUrlState({ version: 1, filter: 'Babylon' })
    expect(search).toContain('mv=1')
    expect(search).toContain('findspot=Babylon')
  })

  it('round-trips through parseMapUrlState', () => {
    const state = { version: 1, filter: 'Aššur' }
    expect(parseMapUrlState(serializeMapUrlState(state))).toEqual(state)
  })

  it('caps an overlong filter before writing it to the URL', () => {
    const overlong = 'a'.repeat(MAX_FILTER_LENGTH + 50)
    const search = serializeMapUrlState({ version: 1, filter: overlong })
    const written = parseMapUrlState(search)
    expect(written.filter).toHaveLength(MAX_FILTER_LENGTH)
  })
})
