import { normalizeMediaSummary } from './mediaMapper'

describe('media summary normalization', () => {
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

  test('drops invalid primary types but keeps valid summary types', () => {
    expect(
      normalizeMediaSummary({
        count: 1,
        types: ['PHOTO'],
        primary: {
          id: 'media-id',
          type: 'BAD',
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

  test('adds a valid primary type that is missing from the type list', () => {
    expect(
      normalizeMediaSummary({
        count: 1,
        types: ['PHOTO'],
        primary: {
          id: 'copy-id',
          type: 'COPY',
        },
      }),
    ).toEqual({
      count: 1,
      types: ['PHOTO', 'COPY'],
      primary: {
        id: 'copy-id',
        type: 'COPY',
      },
    })
  })

  test('keeps primary data and drops malformed primary thumbnails', () => {
    expect(
      normalizeMediaSummary({
        count: 1,
        types: ['PHOTO'],
        primary: {
          id: 'photo-id',
          type: 'PHOTO',
          thumbnail: {
            url: '',
            mimeType: 'image/jpeg',
          },
        },
      }),
    ).toEqual({
      count: 1,
      types: ['PHOTO'],
      primary: {
        id: 'photo-id',
        type: 'PHOTO',
      },
    })
  })

  test('returns null for malformed summary objects', () => {
    expect(normalizeMediaSummary(null)).toBeNull()
    expect(normalizeMediaSummary('not-a-summary')).toBeNull()
    expect(normalizeMediaSummary({ count: 1, types: 'PHOTO' })).toBeNull()
    expect(normalizeMediaSummary({ count: -1, types: ['PHOTO'] })).toBeNull()
  })

  test('keeps a safe shell for positive counts with no valid type or primary', () => {
    expect(
      normalizeMediaSummary({
        count: 1,
        types: ['BAD'],
      }),
    ).toEqual({
      count: 1,
      types: [],
    })
  })
})
