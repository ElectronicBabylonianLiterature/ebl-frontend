import { normalizeLegacyMediaSummary } from 'fragmentarium/infrastructure/mediaMapper'

describe('legacy media summary normalization', () => {
  test('normalizes a legacy photo with a thumbnail path', () => {
    expect(
      normalizeLegacyMediaSummary(true, '/fragments/K.1/thumbnail/small'),
    ).toEqual({
      mediaSummary: {
        count: 1,
        types: ['PHOTO'],
      },
      legacyThumbnailPath: '/fragments/K.1/thumbnail/small',
      newSummaryIsMalformed: false,
    })
  })

  test('normalizes a legacy photo without a thumbnail path', () => {
    expect(normalizeLegacyMediaSummary(true)).toEqual({
      mediaSummary: {
        count: 1,
        types: ['PHOTO'],
      },
      legacyThumbnailPath: null,
      newSummaryIsMalformed: false,
    })
  })

  test('normalizes a legacy photo with an explicit null thumbnail path', () => {
    expect(normalizeLegacyMediaSummary(true, null)).toEqual({
      mediaSummary: {
        count: 1,
        types: ['PHOTO'],
      },
      legacyThumbnailPath: null,
      newSummaryIsMalformed: false,
    })
  })

  test('treats thumbnailPath as an unconditional route hint, not gated by hasPhoto', () => {
    expect(
      normalizeLegacyMediaSummary(false, '/fragments/K.1/thumbnail/small'),
    ).toEqual({
      mediaSummary: null,
      legacyThumbnailPath: '/fragments/K.1/thumbnail/small',
      newSummaryIsMalformed: false,
    })
  })

  test('returns null values for legacy no-photo input without a path', () => {
    expect(normalizeLegacyMediaSummary(false)).toEqual({
      mediaSummary: null,
      legacyThumbnailPath: null,
      newSummaryIsMalformed: false,
    })
  })
})
