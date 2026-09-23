import {
  getReportableMapError,
  isMapBackgroundLoadError,
  MAP_STYLE_URL,
} from 'map/maplibre/mapBackgroundError'

describe('isMapBackgroundLoadError', () => {
  it('recognises failures of the style url the map actually loads', () => {
    expect(MAP_STYLE_URL).toBe(
      'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    )
    expect(
      isMapBackgroundLoadError({
        error: { url: MAP_STYLE_URL, message: 'Not Found' },
      }),
    ).toBe(true)
  })

  it.each([
    [
      'style document AJAXError (404, matching url)',
      {
        error: {
          url: MAP_STYLE_URL,
          message: `AJAXError: Not Found (404): ${MAP_STYLE_URL}`,
        },
      },
    ],
    [
      'style document network failure (status 0, matching url)',
      {
        error: {
          url: MAP_STYLE_URL,
          message: `AJAXError:  (0): ${MAP_STYLE_URL}`,
        },
      },
    ],
  ])('classifies %s as a background failure', (_label, event) => {
    expect(isMapBackgroundLoadError(event)).toBe(true)
  })

  it.each([
    [
      'tile failure (sourceId and tile present)',
      {
        error: { url: `${MAP_STYLE_URL}/../0/0/0.pbf`, message: 'Not Found' },
        sourceId: 'ebl-findspots',
        tile: {},
      },
    ],
    [
      'sprite failure',
      {
        error: {
          url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/sprite.json',
          message: 'Not Found',
        },
      },
    ],
    [
      'glyph failure',
      {
        error: {
          url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/fonts/0-255.pbf',
          message: 'Not Found',
        },
      },
    ],
    [
      'application GeoJSON source error',
      { error: { message: 'invalid geojson' }, sourceId: 'ebl-findspots' },
    ],
    [
      'layer paint/layout error',
      { error: { message: 'expected number' }, layer: { id: 'ebl-clusters' } },
    ],
    [
      'hostname lookalike',
      {
        error: {
          url: 'https://basemaps.cartocdn.com.evil.example/gl/positron-gl-style/style.json',
          message: 'Not Found',
        },
      },
    ],
    [
      'path lookalike',
      {
        error: {
          url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json.evil',
          message: 'Not Found',
        },
      },
    ],
    [
      'relative url',
      { error: { url: '/gl/positron-gl-style/style.json', message: 'x' } },
    ],
    ['invalid url', { error: { url: 'not a url', message: 'x' } }],
    [
      'generic network failure with no url',
      { error: { message: 'Failed to fetch' } },
    ],
    ['error without a nested error object', { sourceId: 'ebl-findspots' }],
    ['non-object nested error', { error: 'oops' }],
    ['non-string message', { error: { message: 42 } }],
    ['non-object event', 'Failed to fetch style.json'],
    ['null event', null],
    ['undefined event', undefined],
  ])('does not classify %s as a background failure', (_label, event) => {
    expect(isMapBackgroundLoadError(event)).toBe(false)
  })
})

describe('getReportableMapError', () => {
  it('returns the error for a GeoJSON source failure', () => {
    const error = new Error('Invalid GeoJSON')

    expect(getReportableMapError({ error, sourceId: 'ebl-findspots' })).toBe(
      error,
    )
  })

  it('wraps a plain error-like object from a layer failure', () => {
    expect(
      getReportableMapError({
        error: { message: 'expected number' },
        layer: { id: 'ebl-clusters' },
      }),
    ).toEqual(new Error('expected number'))
  })

  it.each([
    [
      'a sprite failure',
      {
        error: {
          url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/sprite.json',
          message: 'Not Found',
        },
      },
    ],
    [
      'a glyph failure',
      {
        error: {
          url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/fonts/0-255.pbf',
          message: 'Not Found',
        },
      },
    ],
    [
      'a style parse error carrying no url',
      { error: { message: 'Expected a valid layer type' } },
    ],
  ])('reports %s so it is not silently discarded', (_label, event) => {
    expect(getReportableMapError(event)).toEqual(
      new Error((event.error as { message: string }).message),
    )
  })

  it.each([
    [
      'a tile miss',
      { error: { message: 'Not Found' }, sourceId: 's', tile: {} },
    ],
    [
      'the style document failure that already shows a banner',
      { error: { url: MAP_STYLE_URL, message: 'x' } },
    ],
    ['an event without a message', { sourceId: 'ebl-findspots' }],
    ['a non-object event', 'boom'],
    ['null', null],
  ])('returns null for %s', (_label, event) => {
    expect(getReportableMapError(event)).toBeNull()
  })
})
