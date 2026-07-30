import { isMapBackgroundLoadError } from 'map/mapBackgroundError'

describe('isMapBackgroundLoadError', () => {
  it('classifies configured style-document failures', () => {
    expect(
      isMapBackgroundLoadError({
        resourceType: 'style',
        error: {
          message:
            'Failed to fetch https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
        },
      }),
    ).toBe(true)
  })

  it('classifies events carrying the configured style URL', () => {
    expect(
      isMapBackgroundLoadError({
        url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
        error: { message: 'Network error' },
      }),
    ).toBe(true)
  })

  it.each([
    ['unrelated API failure', { error: { message: 'Failed to fetch /api' } }],
    [
      'individual tile failure',
      {
        resourceType: 'tile',
        error: {
          message:
            'Failed to fetch https://basemaps.cartocdn.com/gl/positron-gl-style/0/0/0.pbf',
        },
      },
    ],
    [
      'sprite failure',
      {
        resourceType: 'sprite',
        error: {
          message:
            'Failed to load https://basemaps.cartocdn.com/gl/positron-gl-style/sprite.json',
        },
      },
    ],
    [
      'glyph failure',
      {
        resourceType: 'glyphs',
        error: {
          message:
            'Failed to load https://basemaps.cartocdn.com/gl/positron-gl-style/fonts/0-255.pbf',
        },
      },
    ],
    ['generic network message', { error: { message: 'Failed to fetch' } }],
    ['unknown error payload', { error: {} }],
    ['non-error value', 'Failed to fetch style.json'],
  ])('ignores %s', (_label, event) => {
    expect(isMapBackgroundLoadError(event)).toBe(false)
  })
})
