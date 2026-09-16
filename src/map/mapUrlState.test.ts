import {
  DEFAULT_MAP_URL_STATE,
  MAX_MAP_URL_LENGTH,
  type MapUrlState,
  parseMapUrlState,
  serializeMapUrlState,
} from './mapUrlState'

const context = {
  knownOverlayIds: new Set(['overlay-a', 'overlay-b']),
}

const fullState: MapUrlState = {
  camera: { center: [43.25, 35.45], zoom: 14.5, bearing: 30, pitch: 45 },
  layers: ['boundaries', 'areas'],
  overlays: [
    { id: 'overlay-b', opacity: 0.5, visible: true },
    { id: 'overlay-a', opacity: 0.75, visible: true },
  ],
  selection: { type: 'excavation-area', polygonId: 'assur-area-a' },
  siteFilter: 'aš',
  visualization: 'count',
  tools: DEFAULT_MAP_URL_STATE.tools,
}

describe('serializeMapUrlState', () => {
  it('writes a deterministic, ordered query string', () => {
    expect(serializeMapUrlState(fullState)).toBe(
      'v=1&c=43.25%2C35.45&z=14.5&b=30&p=45&l=areas%2Cboundaries&o=overlay-b%3A0.5%2Coverlay-a%3A0.75&area=assur-area-a&q=a%C5%A1&viz=count',
    )
  })

  it('omits neutral camera angles, overlays and filters', () => {
    expect(serializeMapUrlState(DEFAULT_MAP_URL_STATE)).toBe(
      'v=1&c=44.4%2C33&z=5&l=boundaries',
    )
  })

  it('keeps a site selection distinct from an area selection', () => {
    expect(
      serializeMapUrlState({
        ...DEFAULT_MAP_URL_STATE,
        selection: { type: 'site', provenanceId: 'babylon' },
      }),
    ).toContain('site=babylon')
  })

  it('excludes hidden overlays', () => {
    expect(
      serializeMapUrlState({
        ...DEFAULT_MAP_URL_STATE,
        overlays: [{ id: 'overlay-a', opacity: 1, visible: false }],
      }),
    ).not.toContain('o=')
  })

  it('drops overlays when the url would grow too long', () => {
    const overlays = Array.from({ length: 40 }, (_entry, index) => ({
      id: `overlay-${'x'.repeat(60)}-${index}`,
      opacity: 0.5,
      visible: true,
    }))
    const serialized = serializeMapUrlState({
      ...DEFAULT_MAP_URL_STATE,
      overlays,
    })

    expect(serialized).not.toContain('o=')
    expect(serialized.length).toBeLessThanOrEqual(MAX_MAP_URL_LENGTH)
  })
})

describe('parseMapUrlState', () => {
  it('round-trips a full state', () => {
    expect(parseMapUrlState(serializeMapUrlState(fullState), context)).toEqual(
      fullState,
    )
  })

  it.each([['v=2&z=9'], ['z=9'], ['v=abc&z=9'], ['']])(
    'falls back to defaults for %s',
    (search) => {
      expect(parseMapUrlState(search, context)).toEqual(DEFAULT_MAP_URL_STATE)
    },
  )

  it('accepts a partial state', () => {
    expect(parseMapUrlState('v=1&z=11', context)).toEqual({
      ...DEFAULT_MAP_URL_STATE,
      camera: { ...DEFAULT_MAP_URL_STATE.camera, zoom: 11 },
    })
  })

  it('clamps out-of-range camera values', () => {
    expect(
      parseMapUrlState('v=1&c=999,999&z=99&b=999&p=999', context).camera,
    ).toEqual({
      center: [180, 85.0511],
      zoom: 24,
      bearing: 180,
      pitch: 85,
    })
  })

  it('ignores malformed camera values', () => {
    expect(parseMapUrlState('v=1&c=abc&z=abc', context).camera).toEqual(
      DEFAULT_MAP_URL_STATE.camera,
    )
  })

  it('drops unknown layers and overlays', () => {
    const state = parseMapUrlState(
      'v=1&l=boundaries,ghosts&o=overlay-a:0.4,missing:1,overlay-a:0.9',
      context,
    )

    expect(state.layers).toEqual(['boundaries'])
    expect(state.overlays).toEqual([
      { id: 'overlay-a', opacity: 0.4, visible: true },
    ])
  })

  it('clamps overlay opacity and defaults a missing one', () => {
    expect(
      parseMapUrlState('v=1&o=overlay-a:9,overlay-b', context).overlays,
    ).toEqual([
      { id: 'overlay-a', opacity: 1, visible: true },
      { id: 'overlay-b', opacity: 1, visible: true },
    ])
  })

  it('parses an empty layer list', () => {
    expect(parseMapUrlState('v=1&l=', context).layers).toEqual([])
  })

  it('drops a polygon selection that no longer exists', () => {
    expect(
      parseMapUrlState('v=1&area=removed', {
        ...context,
        knownPolygonIds: new Set(['assur-area-a']),
      }).selection,
    ).toBeNull()
  })

  it('keeps a polygon selection that still exists', () => {
    expect(
      parseMapUrlState('v=1&area=assur-area-a', {
        ...context,
        knownPolygonIds: new Set(['assur-area-a']),
      }).selection,
    ).toEqual({ type: 'excavation-area', polygonId: 'assur-area-a' })
  })

  it('truncates an over-long site filter', () => {
    expect(
      parseMapUrlState(`v=1&q=${'a'.repeat(500)}`, context).siteFilter,
    ).toHaveLength(120)
  })
})
