import {
  normalizeCompatibleMediaSummary,
  normalizeLegacyMediaSummary,
} from './mediaMapper'

describe('compatible media summary normalization', () => {
  test('uses a valid new summary without legacy fallback', () => {
    expect(
      normalizeCompatibleMediaSummary({
        mediaSummary: {
          count: 2,
          types: ['PHOTO', 'COPY'],
          primary: {
            id: 'media-id',
            type: 'PHOTO',
            thumbnail: {
              url: '/thumbnail',
              mimeType: 'image/jpeg',
              width: 240,
              height: 180,
            },
          },
        },
        hasPhoto: true,
        thumbnailPath: '/legacy-thumbnail',
      }),
    ).toEqual({
      mediaSummary: {
        count: 2,
        types: ['PHOTO', 'COPY'],
        primary: {
          id: 'media-id',
          type: 'PHOTO',
          thumbnail: {
            url: '/thumbnail',
            mimeType: 'image/jpeg',
            width: 240,
            height: 180,
          },
        },
      },
      legacyThumbnailPath: null,
    })
  })

  test('normalizes a legacy photo with a thumbnail path', () => {
    expect(
      normalizeLegacyMediaSummary(true, '/fragments/K.1/thumbnail/small'),
    ).toEqual({
      mediaSummary: {
        count: 1,
        types: ['PHOTO'],
      },
      legacyThumbnailPath: '/fragments/K.1/thumbnail/small',
    })
  })

  test('normalizes a legacy photo without a thumbnail path', () => {
    expect(normalizeLegacyMediaSummary(true)).toEqual({
      mediaSummary: {
        count: 1,
        types: ['PHOTO'],
      },
      legacyThumbnailPath: null,
    })
  })

  test('normalizes a legacy photo with an explicit null thumbnail path', () => {
    expect(normalizeLegacyMediaSummary(true, null)).toEqual({
      mediaSummary: {
        count: 1,
        types: ['PHOTO'],
      },
      legacyThumbnailPath: null,
    })
  })

  test('returns null for legacy no-photo input', () => {
    expect(normalizeLegacyMediaSummary(false)).toEqual({
      mediaSummary: null,
      legacyThumbnailPath: null,
    })
  })

  test('falls back to legacy when the new summary is malformed', () => {
    expect(
      normalizeCompatibleMediaSummary({
        mediaSummary: {
          count: -1,
          types: 'PHOTO',
        },
        hasPhoto: true,
        thumbnailPath: '/legacy-thumbnail',
      }),
    ).toEqual({
      mediaSummary: {
        count: 1,
        types: ['PHOTO'],
      },
      legacyThumbnailPath: '/legacy-thumbnail',
    })
  })

  test('keeps a safe malformed summary when no legacy fallback exists', () => {
    expect(
      normalizeCompatibleMediaSummary({
        mediaSummary: {
          count: 0,
          types: ['PHOTO'],
          primary: { id: 'media-id', type: 'PHOTO' },
        },
        hasPhoto: false,
      }),
    ).toEqual({
      mediaSummary: { count: 0, types: [] },
      legacyThumbnailPath: null,
    })
  })
})
