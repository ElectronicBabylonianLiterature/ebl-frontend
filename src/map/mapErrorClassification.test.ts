import {
  classifyMapResourceKind,
  isBaseStyleFailure,
} from './mapErrorClassification'

const STYLE_URL = 'https://basemaps.example/style.json'

describe('classifyMapResourceKind', () => {
  it.each([
    ['Style', 'style'],
    ['Tile', 'tile'],
    ['SpriteImage', 'sprite'],
    ['SpriteJSON', 'sprite'],
    ['Glyphs', 'glyphs'],
    ['Source', 'source'],
  ])('uses the declared resource type %s', (resourceType, expected) => {
    expect(classifyMapResourceKind({ error: { resourceType } })).toBe(expected)
  })

  it('reads the resource type from the request', () => {
    expect(
      classifyMapResourceKind({ error: { request: { type: 'Tile' } } }),
    ).toBe('tile')
  })

  it('classifies tile events without a resource type', () => {
    expect(classifyMapResourceKind({ tile: {} })).toBe('tile')
  })

  it('classifies source events without a resource type', () => {
    expect(classifyMapResourceKind({ sourceId: 'ebl-findspots' })).toBe(
      'source',
    )
  })

  it.each([
    ['https://tiles.example/sprite@2x.png', 'sprite'],
    ['https://tiles.example/fonts/Open%20Sans/0-255.pbf', 'glyphs'],
    ['https://tiles.example/{fontstack}/0-255', 'glyphs'],
    ['https://tiles.example/tiles/3/4/5.pbf', 'tile'],
    ['https://tiles.example/styles/positron.json', 'style'],
    ['https://example.com/anything', 'unknown'],
  ])('falls back to the url %s', (url, expected) => {
    expect(classifyMapResourceKind({ error: { url } })).toBe(expected)
  })

  it('returns unknown without any hint', () => {
    expect(classifyMapResourceKind({})).toBe('unknown')
    expect(classifyMapResourceKind({ error: 'failed to fetch' })).toBe(
      'unknown',
    )
  })
})

describe('isBaseStyleFailure', () => {
  it('accepts a failure of the configured style document', () => {
    expect(
      isBaseStyleFailure(
        { error: { resourceType: 'Style', url: STYLE_URL } },
        STYLE_URL,
      ),
    ).toBe(true)
  })

  it('accepts a style failure without a url', () => {
    expect(
      isBaseStyleFailure({ error: { resourceType: 'Style' } }, STYLE_URL),
    ).toBe(true)
  })

  it('rejects a style failure of a different document', () => {
    expect(
      isBaseStyleFailure(
        { error: { resourceType: 'Style', url: 'https://other/style.json' } },
        STYLE_URL,
      ),
    ).toBe(false)
  })

  it.each([
    ['tile', { tile: {}, error: { resourceType: 'Tile' } }],
    ['source', { sourceId: 'ebl-findspots', error: { message: 'boom' } }],
    ['sprite', { error: { resourceType: 'SpriteJSON' } }],
    ['glyphs', { error: { resourceType: 'Glyphs' } }],
    ['network', { error: new Error('Failed to fetch') }],
  ])('rejects a %s failure', (_label, event) => {
    expect(isBaseStyleFailure(event, STYLE_URL)).toBe(false)
  })
})
