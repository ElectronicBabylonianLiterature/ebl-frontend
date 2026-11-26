import {
  DEFAULT_MAP_URL_STATE,
  type MapUrlState,
  mergeMapUrlStateIntoSearch,
  parseMapUrlState,
  serializeMapUrlState,
} from 'map/domain/mapUrlState'

const STATE_CASES: readonly [string, Partial<MapUrlState>][] = [
  ['defaults', {}],
  ['filter', { filter: 'Uruk' }],
  ['areas hidden', { showExcavationAreas: false }],
  [
    'selection',
    { selection: { type: 'excavation-area', polygonId: 'uruk-area' } },
  ],
  ['visualization', { visualization: 'count' }],
  ['terrain', { terrain: true }],
]

it.each(STATE_CASES)(
  'preserves the normalized state and explicit area visibility for %s',
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
    const expected = new URLSearchParams(serialized)
    expected.set('mv', '1')
    expected.set('areas', state.showExcavationAreas ? '1' : '0')
    expect(Object.fromEntries(parameters)).toEqual(Object.fromEntries(expected))
  },
)

it('clears research parameters while preserving explicit area visibility', () => {
  expect(serializeMapUrlState(DEFAULT_MAP_URL_STATE)).toBe('')
  expect(
    mergeMapUrlStateIntoSearch(
      'mv=1&findspot=Uruk&areas=1&selected=area:uruk&viz=count&terrain=1&outside=a',
      DEFAULT_MAP_URL_STATE,
    ),
  ).toBe('outside=a&mv=1&areas=1')
})

it('treats repeated valueless fields as empty strings', () => {
  expect(parseMapUrlState('mv=1&findspot&findspot')).toEqual(
    DEFAULT_MAP_URL_STATE,
  )
})

it('uses the same encoding and managed parameter order for standalone and merged state', () => {
  const state: MapUrlState = {
    ...DEFAULT_MAP_URL_STATE,
    filter: 'Ur uk',
    showExcavationAreas: true,
    selection: { type: 'excavation-area', polygonId: 'uruk-area' },
    visualization: 'count',
    terrain: true,
  }

  expect(serializeMapUrlState(state)).toBe(
    'mv=1&findspot=Ur+uk&areas=1&selected=area%3Auruk-area&viz=count&terrain=1',
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
