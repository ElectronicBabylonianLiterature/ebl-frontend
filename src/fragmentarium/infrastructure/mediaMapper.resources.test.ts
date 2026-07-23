import {
  normalizeFragmentMediaResponse,
  normalizeMediaReference,
  normalizeMediaResource,
} from './mediaMapper'

const validRepresentations = {
  original: {
    url: '/media/file',
    mimeType: 'image/jpeg',
  },
}

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
        references: [{ id: 'bib-1' }, { id: '' }, {}, 'bad-reference'],
        representations: {
          original: {
            url: '/media/file',
            mimeType: 'image/svg+xml',
            width: 4000,
            height: 3000,
          },
          display: {
            url: '/media/display',
            mimeType: 'image/png',
            width: 1600,
            height: 1200,
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
        display: {
          url: '/media/display',
          mimeType: 'image/png',
          width: 1600,
          height: 1200,
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

  test('defaults non-array references to an empty list', () => {
    expect(
      normalizeMediaResource({
        id: 'media-id',
        type: 'PHOTO',
        sortOrder: 0,
        isPrimary: true,
        references: 'not-an-array',
        representations: validRepresentations,
      }),
    ).toEqual({
      id: 'media-id',
      type: 'PHOTO',
      sortOrder: 0,
      isPrimary: true,
      references: [],
      representations: {
        original: {
          url: '/media/file',
          mimeType: 'image/jpeg',
        },
        thumbnails: {},
      },
    })
  })

  test.each([
    ['non-record resource', null],
    [
      'blank id',
      {
        id: '',
        type: 'PHOTO',
        sortOrder: 0,
        isPrimary: true,
        representations: validRepresentations,
      },
    ],
    [
      'unknown media type',
      {
        id: 'media-id',
        type: 'BAD',
        sortOrder: 0,
        isPrimary: true,
        representations: validRepresentations,
      },
    ],
    [
      'invalid sort order',
      {
        id: 'media-id',
        type: 'PHOTO',
        sortOrder: -1,
        isPrimary: true,
        representations: validRepresentations,
      },
    ],
    [
      'invalid primary flag',
      {
        id: 'media-id',
        type: 'PHOTO',
        sortOrder: 0,
        isPrimary: 'true',
        representations: validRepresentations,
      },
    ],
    [
      'invalid original representation',
      {
        id: 'media-id',
        type: 'PHOTO',
        sortOrder: 0,
        isPrimary: true,
        representations: { original: { url: '', mimeType: 'image/jpeg' } },
      },
    ],
  ])('rejects media resources with %s', (_label, resource) => {
    expect(normalizeMediaResource(resource)).toBeUndefined()
  })

  test('normalizes valid media references only', () => {
    expect(normalizeMediaReference({ id: 'ref-1' })).toEqual({ id: 'ref-1' })
    expect(normalizeMediaReference({ id: '' })).toBeUndefined()
    expect(normalizeMediaReference(null)).toBeUndefined()
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
            representations: validRepresentations,
          },
          {
            id: 'invalid-media',
            type: 'BAD',
            sortOrder: 1,
            isPrimary: false,
            representations: validRepresentations,
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
    expect(normalizeFragmentMediaResponse(undefined).media).toEqual([])
    expect(
      normalizeFragmentMediaResponse({ media: 'not-an-array' }).media,
    ).toEqual([])
  })
})
