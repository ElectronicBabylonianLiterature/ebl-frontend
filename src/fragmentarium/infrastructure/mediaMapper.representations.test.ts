import {
  normalizeMediaRepresentation,
  normalizeMediaRepresentations,
  normalizeThumbnailSize,
  normalizeUrl,
} from './mediaMapper'

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

  test('returns undefined for invalid representation records', () => {
    expect(normalizeMediaRepresentation(null)).toBeUndefined()
    expect(normalizeMediaRepresentation('image')).toBeUndefined()
    expect(
      normalizeMediaRepresentation({
        url: '',
        mimeType: 'image/jpeg',
      }),
    ).toBeUndefined()
    expect(
      normalizeMediaRepresentation({
        url: '/thumbnail',
        mimeType: '',
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
      }),
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
      normalizeMediaRepresentations({
        original: {
          url: '/original',
          mimeType: 'image/jpeg',
        },
        display: {
          url: '',
          mimeType: 'image/jpeg',
        },
      }),
    ).toEqual({
      original: {
        url: '/original',
        mimeType: 'image/jpeg',
      },
      thumbnails: {},
    })
  })

  test('rejects malformed representation collections and originals', () => {
    expect(normalizeMediaRepresentations(null)).toBeUndefined()
    expect(normalizeMediaRepresentations('representations')).toBeUndefined()
    expect(
      normalizeMediaRepresentations({
        original: {
          url: '',
          mimeType: 'image/jpeg',
        },
      }),
    ).toBeUndefined()
  })

  test('normalizes urls and thumbnail sizes', () => {
    expect(normalizeUrl(' /media/file ')).toBe('/media/file')
    expect(normalizeUrl('')).toBeUndefined()

    expect(normalizeThumbnailSize('small')).toBe('small')
    expect(normalizeThumbnailSize('medium')).toBe('medium')
    expect(normalizeThumbnailSize('large')).toBe('large')
    expect(normalizeThumbnailSize('x-large')).toBeUndefined()
  })
})
