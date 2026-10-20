import {
  DEFAULT_MAP_URL_STATE,
  type MapUrlState,
  mergeMapUrlStateIntoSearch,
  parseMapUrlState,
  serializeMapUrlState,
} from 'map/mapUrlState'

const STATE_CASES: readonly [string, Partial<MapUrlState>][] = [
  ['defaults', {}],
  ['filter', { filter: 'Uruk' }],
  ['areas', { showExcavationAreas: true }],
  [
    'selection',
    { selection: { type: 'excavation-area', polygonId: 'uruk-area' } },
  ],
  ['visualization', { visualization: 'count' }],
  ['terrain', { terrain: true }],
]

it.each(STATE_CASES)(
  'serializes and merges the same normalized state for %s',
  (_label, changes) => {
    const state = { ...DEFAULT_MAP_URL_STATE, ...changes }
    const serialized = serializeMapUrlState(state)
    const merged = mergeMapUrlStateIntoSearch(
      'outside=a&mv=1&findspot=old&areas=1&selected=area:old&viz=evidence&terrain=1&outside=b',
      state,
    )
    const parameters = new URLSearchParams(merged)

    expect(parseMapUrlState(serialized)).toEqual(state)
    expect(parseMapUrlState(merged)).toEqual(state)
    expect(parameters.getAll('outside')).toEqual(['a', 'b'])
    parameters.delete('outside')
    expect(Object.fromEntries(parameters)).toEqual(
      Object.fromEntries(new URLSearchParams(serialized)),
    )
  },
)

it('clears all managed parameters when the normalized state is default', () => {
  expect(serializeMapUrlState(DEFAULT_MAP_URL_STATE)).toBe('')
  expect(
    mergeMapUrlStateIntoSearch(
      'mv=1&findspot=Uruk&areas=1&selected=area:uruk&viz=count&terrain=1&outside=a',
      DEFAULT_MAP_URL_STATE,
    ),
  ).toBe('outside=a')
})

it('treats repeated valueless fields as empty strings', () => {
  expect(parseMapUrlState('mv=1&findspot&findspot')).toEqual(
    DEFAULT_MAP_URL_STATE,
  )
})

it('preserves standalone encoding and merged parameter order for every map field', () => {
  const state: MapUrlState = {
    ...DEFAULT_MAP_URL_STATE,
    filter: 'Ur uk',
    showExcavationAreas: true,
    selection: { type: 'excavation-area', polygonId: 'uruk-area' },
    visualization: 'count',
    terrain: true,
  }

  expect(serializeMapUrlState(state)).toBe(
    'areas=1&findspot=Ur%20uk&mv=1&selected=area%3Auruk-area&terrain=1&viz=count',
  )
  expect(
    mergeMapUrlStateIntoSearch(
      '?outside=first&mv=999&findspot=old&outside=second&areas=0&selected=area:old&viz=evidence&terrain=0',
      state,
    ),
  ).toBe(
    'outside=first&outside=second&mv=1&findspot=Ur+uk&areas=1&selected=area%3Auruk-area&viz=count&terrain=1',
  )
})
