import {
  normalizeCompatibleMediaSummary,
  normalizeFragmentMediaResponse,
} from 'fragmentarium/infrastructure/mediaMapper'

describe('unrecognized media type diagnostics', () => {
  test('preserves recognized summary types and reports a dropped type', () => {
    expect(
      normalizeCompatibleMediaSummary({
        mediaSummary: {
          count: 2,
          types: ['PHOTO', 'LINE_DRAWING'],
        },
      }),
    ).toEqual({
      mediaSummary: {
        count: 2,
        types: ['PHOTO'],
      },
      legacyThumbnailPath: null,
      newSummaryIsMalformed: false,
      hasUnrecognizedMedia: true,
    })
  })

  test('preserves a valid summary and reports a dropped primary', () => {
    expect(
      normalizeCompatibleMediaSummary({
        mediaSummary: {
          count: 1,
          types: ['PHOTO'],
          primary: {
            id: 'line-drawing-id',
            type: 'LINE_DRAWING',
          },
        },
      }),
    ).toEqual({
      mediaSummary: {
        count: 1,
        types: ['PHOTO'],
      },
      legacyThumbnailPath: null,
      newSummaryIsMalformed: false,
      hasUnrecognizedMedia: true,
    })
  })

  test('preserves recognized resources and reports a dropped resource', () => {
    expect(
      normalizeFragmentMediaResponse({
        media: [
          {
            id: 'photo-id',
            type: 'PHOTO',
            sortOrder: 0,
            isPrimary: true,
            representations: {
              original: {
                url: '/fragments/K.1/media/photo-id/file',
                mimeType: 'image/jpeg',
              },
            },
          },
          {
            id: 'line-drawing-id',
            type: 'LINE_DRAWING',
            sortOrder: 1,
            isPrimary: false,
            representations: {
              original: {
                url: '/fragments/K.1/media/line-drawing-id/file',
                mimeType: 'image/png',
              },
            },
          },
        ],
      }),
    ).toEqual({
      media: [
        {
          id: 'photo-id',
          type: 'PHOTO',
          sortOrder: 0,
          isPrimary: true,
          references: [],
          representations: {
            original: {
              url: '/fragments/K.1/media/photo-id/file',
              mimeType: 'image/jpeg',
            },
            thumbnails: {},
          },
        },
      ],
      hasUnrecognizedMedia: true,
    })
  })
})
