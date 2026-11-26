import {
  DEFAULT_MAP_URL_STATE,
  MAX_FILTER_LENGTH,
  parseMapUrlState,
  serializeMapUrlState,
  mergeMapUrlStateIntoSearch,
} from 'map/domain/mapUrlState'

describe('parseMapUrlState', () => {
  it('returns the default state for an empty search string', () => {
    expect(parseMapUrlState('')).toEqual(DEFAULT_MAP_URL_STATE)
  })

  it('parses a filter from a versioned search string', () => {
    expect(parseMapUrlState('mv=1&findspot=Babylon')).toEqual({
      version: 1,
      filter: 'Babylon',
      showExcavationAreas: true,
      selection: null,
      visualization: 'mapped',
    })
  })

  it('parses the excavation-area flag', () => {
    expect(parseMapUrlState('mv=1&areas=1')).toEqual({
      version: 1,
      filter: '',
      showExcavationAreas: true,
      selection: null,
      visualization: 'mapped',
    })
  })

  it('preserves a legacy unversioned findspot filter', () => {
    expect(parseMapUrlState('findspot=Babylon')).toEqual({
      ...DEFAULT_MAP_URL_STATE,
      filter: 'Babylon',
    })
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

  it.each(['1abc', '1.5', '1e3', '01', '+1', '%201'])(
    'falls back when the version token is %s',
    (version) => {
      expect(parseMapUrlState(`mv=${version}&findspot=Babylon`)).toEqual(
        DEFAULT_MAP_URL_STATE,
      )
    },
  )

  it('uses the first value when the filter param is duplicated', () => {
    expect(parseMapUrlState('mv=1&findspot=a&findspot=b')).toEqual({
      version: 1,
      filter: 'a',
      showExcavationAreas: true,
      selection: null,
      visualization: 'mapped',
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

  it.each([
    ['a lone high surrogate', '\uD800', '\uFFFD'],
    ['a lone low surrogate', '\uDC00', '\uFFFD'],
    ['an embedded lone surrogate', 'before\uD800after', 'before\uFFFDafter'],
  ])('normalizes %s while parsing', (_label, filter, expected) => {
    expect(parseMapUrlState(`mv=1&findspot=${filter}`).filter).toBe(expected)
  })
})

describe('serializeMapUrlState', () => {
  it('serializes to an empty string for the default state', () => {
    expect(serializeMapUrlState(DEFAULT_MAP_URL_STATE)).toBe('')
  })

  it('includes the version and filter when a filter is set', () => {
    const search = serializeMapUrlState({
      version: 1,
      filter: 'Babylon',
      showExcavationAreas: false,
      selection: null,
      visualization: 'mapped',
    })
    expect(search).toContain('mv=1')
    expect(search).toContain('findspot=Babylon')
  })

  it('includes the version and explicit disabled area flag without a filter', () => {
    const search = serializeMapUrlState({
      version: 1,
      filter: '',
      showExcavationAreas: false,
      selection: null,
      visualization: 'mapped',
    })
    expect(search).toContain('mv=1')
    expect(search).toContain('areas=0')
  })

  it('round-trips through parseMapUrlState', () => {
    const state = {
      version: 1,
      filter: 'Aššur',
      showExcavationAreas: true,
      selection: {
        type: 'excavation-area' as const,
        polygonId: 'assur-area-a',
      },
      visualization: 'count' as const,
    }
    expect(parseMapUrlState(serializeMapUrlState(state))).toEqual(state)
  })

  it('caps an overlong filter before writing it to the URL', () => {
    const overlong = 'a'.repeat(MAX_FILTER_LENGTH + 50)
    const search = serializeMapUrlState({
      version: 1,
      filter: overlong,
      showExcavationAreas: false,
      selection: null,
      visualization: 'mapped',
    })
    const written = parseMapUrlState(search)
    expect(written.filter).toHaveLength(MAX_FILTER_LENGTH)
  })

  it('does not split a Unicode character at the filter limit', () => {
    const boundaryFilter = `${'a'.repeat(MAX_FILTER_LENGTH - 1)}😀`
    const search = serializeMapUrlState({
      version: 1,
      filter: boundaryFilter,
      showExcavationAreas: false,
      selection: null,
      visualization: 'mapped',
    })

    expect(parseMapUrlState(search).filter).toBe(boundaryFilter)
  })

  it.each([
    ['a lone high surrogate', '\uD800', '\uFFFD'],
    ['a lone low surrogate', '\uDC00', '\uFFFD'],
    ['an embedded lone surrogate', 'before\uD800after', 'before\uFFFDafter'],
  ])('normalizes %s before serializing', (_label, filter, expected) => {
    const search = serializeMapUrlState({
      version: 1,
      filter,
      showExcavationAreas: false,
      selection: null,
      visualization: 'mapped',
    })

    expect(parseMapUrlState(search).filter).toBe(expected)
  })
})

it.each(['', 'mv=1', 'mv=1&areas=invalid', 'mv=1&areas', 'areas=1'])(
  'shows excavation areas by default for %s',
  (search) => expect(parseMapUrlState(search).showExcavationAreas).toBe(true),
)

it('restores an explicit disabled layer from versioned and legacy links', () => {
  expect(parseMapUrlState('mv=1&areas=0').showExcavationAreas).toBe(false)
  expect(parseMapUrlState('areas=0').showExcavationAreas).toBe(false)
})

it('preserves an explicit enabled preference and unrelated parameters when clearing a filter', () => {
  expect(
    mergeMapUrlStateIntoSearch(
      '?mv=1&findspot=Uruk&areas=1&source=archive',
      DEFAULT_MAP_URL_STATE,
    ),
  ).toBe('source=archive&mv=1&areas=1')
})

it.each([true, false])(
  'round-trips layer visibility %s with a filter',
  (showExcavationAreas) => {
    const state = {
      ...DEFAULT_MAP_URL_STATE,
      filter: 'Uruk',
      showExcavationAreas,
    }
    expect(parseMapUrlState(serializeMapUrlState(state))).toEqual(state)
  },
)

it('uses the first duplicated null visibility value as the default', () => {
  expect(parseMapUrlState('mv=1&areas&areas=0').showExcavationAreas).toBe(true)
})

describe('selection URL state', () => {
  const canonicalPolygonIds = [
    'assur-bb6i-3d76dc1e02af',
    'kalhu-kalhu-17049d0f312c',
    'nippur-scribal-quarter-a566fe34fdbe',
    'uruk-dc-xiv-2-55d0546c4ba6',
  ]

  it.each(canonicalPolygonIds)(
    'round-trips canonical selection %s',
    (polygonId) => {
      const state = {
        ...DEFAULT_MAP_URL_STATE,
        selection: { type: 'excavation-area' as const, polygonId },
      }

      expect(parseMapUrlState(serializeMapUrlState(state))).toEqual(state)
    },
  )

  it('ignores an invalid selection token', () => {
    expect(parseMapUrlState('mv=1&selected=unknown').selection).toBeNull()
  })

  it('uses the first duplicated selection value', () => {
    expect(
      parseMapUrlState(
        'mv=1&selected=area%3Aassur-bb6i-3d76dc1e02af&selected=area%3Auruk-dc-xiv-2-55d0546c4ba6',
      ).selection,
    ).toEqual({
      type: 'excavation-area',
      polygonId: 'assur-bb6i-3d76dc1e02af',
    })
  })
})
