import { normalizeCompatibleMediaSummary } from 'fragmentarium/infrastructure/mediaMapper'

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
      newSummaryIsMalformed: false,
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
      newSummaryIsMalformed: false,
    })
  })

  test('falls back to legacy and flags a malformed new summary', () => {
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
      newSummaryIsMalformed: true,
    })
  })

  test('flags a positive count with no usable type or primary as malformed', () => {
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
      newSummaryIsMalformed: true,
    })
  })

  test('flags media types exceeding the item count as malformed', () => {
    expect(
      normalizeCompatibleMediaSummary({
        mediaSummary: { count: 1, types: ['PHOTO', 'COPY'] },
        hasPhoto: true,
        thumbnailPath: '/legacy-thumbnail',
      }),
    ).toEqual({
      mediaSummary: { count: 1, types: ['PHOTO'] },
      legacyThumbnailPath: '/legacy-thumbnail',
      newSummaryIsMalformed: true,
    })
  })

  test('does not flag an absent new summary as malformed', () => {
    expect(
      normalizeCompatibleMediaSummary({
        mediaSummary: null,
        hasPhoto: 'true',
        thumbnailPath: '/legacy-thumbnail',
      }),
    ).toEqual({
      mediaSummary: null,
      legacyThumbnailPath: '/legacy-thumbnail',
      newSummaryIsMalformed: false,
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
      newSummaryIsMalformed: true,
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
      newSummaryIsMalformed: true,
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
      newSummaryIsMalformed: false,
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
      newSummaryIsMalformed: false,
    })
  })
})
