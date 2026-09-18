import {
  normalizeMediaRepresentations,
  normalizeOriginalRepresentation,
  normalizeRasterRepresentation,
} from 'fragmentarium/infrastructure/mediaMapper'

describe('media representation normalization', () => {
  test('normalizes valid representations and drops invalid dimensions', () => {
    expect(
      normalizeRasterRepresentation({
        url: '/thumbnail',
        mimeType: 'image/jpeg',
        width: 240,
        height: -10,
      }),
    ).toEqual({
      url: '/thumbnail',
      mimeType: 'image/jpeg',
      width: 240,
    })
  })

  test('returns undefined for invalid representation records', () => {
    expect(normalizeRasterRepresentation(null)).toBeUndefined()
    expect(normalizeRasterRepresentation('image')).toBeUndefined()
    expect(
      normalizeRasterRepresentation({
        url: '',
        mimeType: 'image/jpeg',
      }),
    ).toBeUndefined()
    expect(
      normalizeRasterRepresentation({
        url: '/thumbnail',
        mimeType: '',
      }),
    ).toBeUndefined()
  })

  test('normalizes representations with thumbnail maps', () => {
    expect(
      normalizeMediaRepresentations(
        {
          original: {
            url: '/original',
            mimeType: 'image/svg+xml',
          },
          display: {
            url: '/display',
            mimeType: 'image/png',
            width: 1600,
            height: 1200,
          },
          thumbnails: {
            small: {
              url: '/thumbnail/small',
              mimeType: 'image/png',
              width: 240,
              height: 180,
            },
            medium: {
              url: '',
              mimeType: 'image/png',
            },
          },
        },
        'COPY',
      ),
    ).toEqual({
      original: {
        url: '/original',
        mimeType: 'image/svg+xml',
      },
      display: {
        url: '/display',
        mimeType: 'image/png',
        width: 1600,
        height: 1200,
      },
      thumbnails: {
        small: {
          url: '/thumbnail/small',
          mimeType: 'image/png',
          width: 240,
          height: 180,
        },
      },
    })
  })

  test('drops invalid display representations without rejecting originals', () => {
    expect(
      normalizeMediaRepresentations(
        {
          original: {
            url: '/original',
            mimeType: 'image/jpeg',
          },
          display: {
            url: '',
            mimeType: 'image/jpeg',
          },
        },
        'PHOTO',
      ),
    ).toEqual({
      original: {
        url: '/original',
        mimeType: 'image/jpeg',
      },
      thumbnails: {},
    })
  })

  test('keeps an empty thumbnail object when the backend sends one', () => {
    expect(
      normalizeMediaRepresentations(
        {
          original: { url: '/original', mimeType: 'image/png' },
          thumbnails: {},
        },
        'PHOTO',
      ),
    ).toEqual({
      original: { url: '/original', mimeType: 'image/png' },
      thumbnails: {},
    })
  })

  test('ignores unknown thumbnail sizes', () => {
    expect(
      normalizeMediaRepresentations(
        {
          original: { url: '/original', mimeType: 'image/png' },
          thumbnails: {
            'x-large': { url: '/x-large', mimeType: 'image/png' },
          },
        },
        'PHOTO',
      ),
    ).toEqual({
      original: { url: '/original', mimeType: 'image/png' },
      thumbnails: {},
    })
  })

  test('rejects malformed representation collections and originals', () => {
    expect(normalizeMediaRepresentations(null, 'PHOTO')).toBeUndefined()
    expect(
      normalizeMediaRepresentations('representations', 'PHOTO'),
    ).toBeUndefined()
    expect(
      normalizeMediaRepresentations(
        {
          original: {
            url: '',
            mimeType: 'image/jpeg',
          },
        },
        'PHOTO',
      ),
    ).toBeUndefined()
  })

  test('rejects non-record originals for every media type', () => {
    expect(normalizeOriginalRepresentation(null, 'COPY')).toBeUndefined()
    expect(normalizeOriginalRepresentation('original', 'PHOTO')).toBeUndefined()
  })
})
