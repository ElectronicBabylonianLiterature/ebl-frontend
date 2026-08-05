import { isMapBackgroundLoadError, MAP_STYLE_URL } from 'map/mapBackgroundError'

describe('isMapBackgroundLoadError', () => {
  it.each([
    [
      'style document AJAXError (404, matching url)',
      {
        error: {
          url: MAP_STYLE_URL,
          message: `AJAXError: Not Found (404): ${MAP_STYLE_URL}`,
        },
      },
      false,
    ],
    [
      'style document AJAXError after a previous successful load',
      { error: { url: MAP_STYLE_URL, message: 'AJAXError: Not Found (404)' } },
      true,
    ],
    [
      'generic network failure with no url before the style has loaded',
      { error: { message: 'Failed to fetch' } },
      false,
    ],
  ])(
    'classifies %s as a background failure',
    (_label, event, hasStyleLoaded) => {
      expect(isMapBackgroundLoadError(event, hasStyleLoaded)).toBe(true)
    },
  )

  it.each([
    [
      'tile failure (sourceId and tile present)',
      {
        error: { url: `${MAP_STYLE_URL}/../0/0/0.pbf`, message: 'Not Found' },
        sourceId: 'ebl-findspots',
        tile: {},
      },
      false,
    ],
    [
      'sprite failure',
      {
        error: {
          url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/sprite.json',
          message: 'Not Found',
        },
      },
      false,
    ],
    [
      'glyph failure',
      {
        error: {
          url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/fonts/0-255.pbf',
          message: 'Not Found',
        },
      },
      false,
    ],
    [
      'application GeoJSON source error',
      { error: { message: 'invalid geojson' }, sourceId: 'ebl-findspots' },
      true,
    ],
    [
      'layer paint/layout error',
      { error: { message: 'expected number' }, layer: { id: 'ebl-clusters' } },
      false,
    ],
    [
      'hostname lookalike',
      {
        error: {
          url: 'https://basemaps.cartocdn.com.evil.example/gl/positron-gl-style/style.json',
          message: 'Not Found',
        },
      },
      false,
    ],
    [
      'path lookalike',
      {
        error: {
          url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json.evil',
          message: 'Not Found',
        },
      },
      false,
    ],
    [
      'relative url',
      { error: { url: '/gl/positron-gl-style/style.json', message: 'x' } },
      false,
    ],
    ['invalid url', { error: { url: 'not a url', message: 'x' } }, false],
    [
      'generic fetch error after the style has already loaded',
      { error: { message: 'Failed to fetch' } },
      true,
    ],
    [
      'error without a nested error object',
      { sourceId: 'ebl-findspots' },
      false,
    ],
    ['non-object nested error', { error: 'oops' }, false],
    [
      'non-string message after the style has loaded',
      { error: { message: 42 } },
      true,
    ],
    ['non-object event', 'Failed to fetch style.json', false],
    ['null event', null, false],
    ['undefined event', undefined, false],
  ])(
    'does not classify %s as a background failure',
    (_label, event, hasStyleLoaded) => {
      expect(isMapBackgroundLoadError(event, hasStyleLoaded)).toBe(false)
    },
  )
})
