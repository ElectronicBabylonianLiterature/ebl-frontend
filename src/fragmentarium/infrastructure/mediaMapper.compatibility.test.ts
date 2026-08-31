import {
  normalizeCompatibleMediaSummary,
  normalizeLegacyMediaSummary,
} from 'fragmentarium/infrastructure/mediaMapper'

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

  test('keeps legacy thumbnail path with a valid summary missing a primary thumbnail', () => {
    expect(
      normalizeCompatibleMediaSummary({
        mediaSummary: {
          count: 1,
          types: ['PHOTO'],
          primary: {
            id: 'photo-id',
            type: 'PHOTO',
          },
        },
        hasPhoto: true,
        thumbnailPath: '/legacy-thumbnail',
      }),
    ).toEqual({
      mediaSummary: {
        count: 1,
        types: ['PHOTO'],
        primary: {
          id: 'photo-id',
          type: 'PHOTO',
        },
      },
      legacyThumbnailPath: '/legacy-thumbnail',
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

  test('treats thumbnailPath as an unconditional route hint, not gated by hasPhoto', () => {
    expect(
      normalizeLegacyMediaSummary(false, '/fragments/K.1/thumbnail/small'),
    ).toEqual({
      mediaSummary: null,
      legacyThumbnailPath: '/fragments/K.1/thumbnail/small',
    })
  })

  test('returns null values for legacy no-photo input without a path', () => {
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

  test('falls back to legacy when a positive count has no usable type or primary', () => {
    expect(
      normalizeCompatibleMediaSummary({
        mediaSummary: {
          count: 1,
          types: ['BAD'],
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

  test('falls back to legacy when media types exceed the item count', () => {
    expect(
      normalizeCompatibleMediaSummary({
        mediaSummary: { count: 1, types: ['PHOTO', 'COPY'] },
        hasPhoto: true,
        thumbnailPath: '/legacy-thumbnail',
      }),
    ).toEqual({
      mediaSummary: { count: 1, types: ['PHOTO'] },
      legacyThumbnailPath: '/legacy-thumbnail',
    })
  })

  test('keeps legacy thumbnail path without synthesizing media for malformed hasPhoto', () => {
    expect(
      normalizeCompatibleMediaSummary({
        mediaSummary: null,
        hasPhoto: 'true',
        thumbnailPath: '/legacy-thumbnail',
      }),
    ).toEqual({
      mediaSummary: null,
      legacyThumbnailPath: '/legacy-thumbnail',
    })
  })

  test('returns a null summary for critical input when no legacy fallback exists', () => {
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
      mediaSummary: null,
      legacyThumbnailPath: null,
    })
  })

  test('never leaks a positive-count shell when no legacy fallback exists', () => {
    expect(
      normalizeCompatibleMediaSummary({
        mediaSummary: { count: 5, types: ['NOPE'] },
        hasPhoto: false,
        thumbnailPath: '/fragments/K.1/thumbnail/small',
      }),
    ).toEqual({
      mediaSummary: null,
      legacyThumbnailPath: '/fragments/K.1/thumbnail/small',
    })
  })

  test('reports the legacy photo when the new media projection is empty before backfill', () => {
    expect(
      normalizeCompatibleMediaSummary({
        mediaSummary: { count: 0, types: [] },
        hasPhoto: true,
        thumbnailPath: '/fragments/K.1/thumbnail/small',
      }),
    ).toEqual({
      mediaSummary: { count: 1, types: ['PHOTO'] },
      legacyThumbnailPath: '/fragments/K.1/thumbnail/small',
    })
  })

  test('keeps the legacy route hint for an un-backfilled fragment reporting no photo', () => {
    expect(
      normalizeCompatibleMediaSummary({
        mediaSummary: { count: 0, types: [] },
        hasPhoto: false,
        thumbnailPath: '/fragments/K.1/thumbnail/small',
      }),
    ).toEqual({
      mediaSummary: { count: 0, types: [] },
      legacyThumbnailPath: '/fragments/K.1/thumbnail/small',
    })
  })
})
