import {
  normalizeCompatibleMediaSummary,
  normalizeFragmentMediaResponse,
  normalizeLegacyMediaSummary,
  normalizeMediaReference,
  normalizeMediaRepresentation,
  normalizeMediaResource,
  normalizeMediaSummary,
  normalizeMediaRepresentations,
  normalizeThumbnailSize,
} from './mediaMapper'

describe('media summary normalization', () => {
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

  test('normalizes a legacy photo with a thumbnail path without synthetic identity', () => {
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

  test('returns null for legacy no-photo input', () => {
    expect(normalizeLegacyMediaSummary(false)).toEqual({
      mediaSummary: null,
      legacyThumbnailPath: null,
    })
  })

  test('falls back to legacy when the new summary is critically malformed', () => {
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

  test('accepts count greater than zero without a primary selection', () => {
    expect(
      normalizeMediaSummary({
        count: 2,
        types: ['COPY'],
      }),
    ).toEqual({
      count: 2,
      types: ['COPY'],
    })
  })

  test('removes primary data when count is zero', () => {
    expect(
      normalizeMediaSummary({
        count: 0,
        types: ['PHOTO'],
        primary: {
          id: 'media-id',
          type: 'PHOTO',
        },
      }),
    ).toEqual({
      count: 0,
      types: [],
    })
  })

  test('drops invalid primary data but keeps valid summary data', () => {
    expect(
      normalizeMediaSummary({
        count: 1,
        types: ['PHOTO'],
        primary: {
          id: '',
          type: 'PHOTO',
        },
      }),
    ).toEqual({
      count: 1,
      types: ['PHOTO'],
    })
  })

  test('deduplicates valid media types and discards invalid ones', () => {
    expect(
      normalizeMediaSummary({
        count: 2,
        types: ['PHOTO', 'COPY', 'PHOTO', 'INVALID'],
      }),
    ).toEqual({
      count: 2,
      types: ['PHOTO', 'COPY'],
    })
  })
})

describe('media representation normalization', () => {
  test('normalizes valid representations and drops invalid dimensions', () => {
    expect(
      normalizeMediaRepresentation({
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

  test('returns undefined for invalid representations', () => {
    expect(
      normalizeMediaRepresentation({
        url: '',
        mimeType: 'image/jpeg',
      }),
    ).toBeUndefined()
  })

  test('normalizes representations with thumbnail maps', () => {
    expect(
      normalizeMediaRepresentations({
        original: {
          url: '/original',
          mimeType: 'image/svg+xml',
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
      }),
    ).toEqual({
      original: {
        url: '/original',
        mimeType: 'image/svg+xml',
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

  test.each([
    ['small', 'small'],
    ['medium', 'medium'],
    ['large', 'large'],
    ['x-large', undefined],
  ])('normalizes thumbnail size %p', (value, expected) => {
    expect(normalizeThumbnailSize(value)).toBe(expected)
  })
})

describe('media resource normalization', () => {
  test('normalizes a valid media resource', () => {
    expect(
      normalizeMediaResource({
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'COPY',
        sortOrder: 1,
        isPrimary: false,
        caption: ' Obverse ',
        attribution: ' Museum ',
        references: [{ id: 'bib-1' }, { id: '' }, {}],
        representations: {
          original: {
            url: '/media/file',
            mimeType: 'image/svg+xml',
            width: 4000,
            height: 3000,
          },
          thumbnails: {
            small: {
              url: '/media/thumbnail/small',
              mimeType: 'image/png',
              width: 240,
              height: 180,
            },
          },
        },
      }),
    ).toEqual({
      id: '550e8400-e29b-41d4-a716-446655440000',
      type: 'COPY',
      sortOrder: 1,
      isPrimary: false,
      caption: 'Obverse',
      attribution: 'Museum',
      references: [{ id: 'bib-1' }],
      representations: {
        original: {
          url: '/media/file',
          mimeType: 'image/svg+xml',
          width: 4000,
          height: 3000,
        },
        thumbnails: {
          small: {
            url: '/media/thumbnail/small',
            mimeType: 'image/png',
            width: 240,
            height: 180,
          },
        },
      },
    })
  })

  test('rejects media resources with invalid sort order', () => {
    expect(
      normalizeMediaResource({
        id: 'media-id',
        type: 'PHOTO',
        sortOrder: -1,
        isPrimary: true,
        representations: {
          original: {
            url: '/original',
            mimeType: 'image/jpeg',
          },
        },
      }),
    ).toBeUndefined()
  })

  test('normalizes valid media references only', () => {
    expect(normalizeMediaReference({ id: 'ref-1' })).toEqual({ id: 'ref-1' })
    expect(normalizeMediaReference({ id: '' })).toBeUndefined()
  })

  test('excludes malformed media items from a fragment media response', () => {
    expect(
      normalizeFragmentMediaResponse({
        media: [
          {
            id: 'valid-media',
            type: 'PHOTO',
            sortOrder: 0,
            isPrimary: true,
            references: [{ id: 'ref-1' }],
            representations: {
              original: {
                url: '/media/file',
                mimeType: 'image/jpeg',
              },
            },
          },
          {
            id: 'invalid-media',
            type: 'BAD',
            sortOrder: 1,
            isPrimary: false,
            representations: {
              original: {
                url: '/media/file',
                mimeType: 'image/jpeg',
              },
            },
          },
        ],
      }).media,
    ).toEqual([
      {
        id: 'valid-media',
        type: 'PHOTO',
        sortOrder: 0,
        isPrimary: true,
        references: [{ id: 'ref-1' }],
        representations: {
          original: {
            url: '/media/file',
            mimeType: 'image/jpeg',
          },
          thumbnails: {},
        },
      },
    ])
  })

  test('returns an empty media collection for malformed fragment responses', () => {
    expect(
      normalizeFragmentMediaResponse({ media: 'not-an-array' }).media,
    ).toEqual([])
  })
})
