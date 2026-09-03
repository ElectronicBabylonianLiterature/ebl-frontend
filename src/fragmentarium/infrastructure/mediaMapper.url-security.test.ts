import {
  normalizeMediaRepresentations,
  normalizeMediaResource,
  normalizeCompatibleMediaSummary,
} from 'fragmentarium/infrastructure/mediaMapper'
import { normalizeRelativeMediaUrl } from 'fragmentarium/infrastructure/mediaMapperValidation'

const acceptedUrls = [
  '/fragments/K.1/media/media-id/file',
  '/fragments/K.1/media/media-id/display',
  '/fragments/K.1/media/media-id/thumbnail/small',
  '/fragments/K.1/thumbnail/small',
  '/fragments/K.1%2F2/media/media-id/file',
]

const scriptUrl = `${'javascript'}:alert(1)`
const mixedCaseScriptUrl = `${'JavaScript'}:alert(1)`

const rejectedUrls = [
  scriptUrl,
  mixedCaseScriptUrl,
  'data:text/html,<script>alert(1)</script>',
  'http://evil.example/file',
  'https://evil.example/file',
  '//evil.example/file',
  '/\\evil.example/file',
  '../admin',
  'relative/path',
  'fragments/K.1/media/media-id/file',
  '/fragments/../admin',
  '/fragments/%2e%2e/admin',
  '/fragments/%2E%2E/admin',
  '/fragments/.%2e/admin',
  '/fragments/%0Aadmin',
  '/fragments/%7Fadmin',
  '/fragments/%zz/file',
  '/fragments/K.1/media/media-id/file?token=secret',
  '/fragments/K.1/media/media-id/file#fragment',
  '/fragments/K.1/a\nb',
  '/',
  '',
  '   ',
]

describe('relative media url trust boundary', () => {
  test.each(acceptedUrls)('accepts same-origin relative path %p', (url) => {
    expect(normalizeRelativeMediaUrl(url)).toBe(url)
  })

  test.each(rejectedUrls)('rejects unsafe url %p', (url) => {
    expect(normalizeRelativeMediaUrl(url)).toBeUndefined()
  })

  test.each([null, undefined, 42, true, {}, ['/safe']])(
    'rejects non-string url %p',
    (url) => {
      expect(normalizeRelativeMediaUrl(url)).toBeUndefined()
    },
  )

  test('trims surrounding whitespace instead of rejecting the path', () => {
    expect(normalizeRelativeMediaUrl('  /fragments/K.1/media/x/file  ')).toBe(
      '/fragments/K.1/media/x/file',
    )
  })
})

describe('unsafe urls in mapped representations', () => {
  test.each(rejectedUrls)(
    'rejects the whole resource when the original url is %p',
    (url) => {
      expect(
        normalizeMediaResource({
          id: 'media-id',
          type: 'PHOTO',
          sortOrder: 0,
          isPrimary: true,
          representations: {
            original: { url, mimeType: 'image/jpeg' },
          },
        }),
      ).toBeUndefined()
    },
  )

  test('drops an unsafe display without rejecting a safe original', () => {
    expect(
      normalizeMediaRepresentations(
        {
          original: {
            url: '/fragments/K.1/media/x/file',
            mimeType: 'image/png',
          },
          display: { url: 'https://evil.example/x', mimeType: 'image/png' },
          thumbnails: {
            small: { url: '//evil.example/t', mimeType: 'image/png' },
          },
        },
        'PHOTO',
      ),
    ).toEqual({
      original: { url: '/fragments/K.1/media/x/file', mimeType: 'image/png' },
      thumbnails: {},
    })
  })
})

describe('unsafe legacy thumbnail paths', () => {
  test('keeps a safe legacy route hint', () => {
    expect(
      normalizeCompatibleMediaSummary({
        hasPhoto: true,
        thumbnailPath: '/fragments/K.1/thumbnail/small',
      }),
    ).toEqual({
      mediaSummary: { count: 1, types: ['PHOTO'] },
      legacyThumbnailPath: '/fragments/K.1/thumbnail/small',
      newSummaryIsMalformed: false,
    })
  })

  test.each(['https://evil.example/t', '//evil.example/t', scriptUrl])(
    'drops unsafe legacy thumbnail path %p',
    (thumbnailPath) => {
      expect(
        normalizeCompatibleMediaSummary({
          hasPhoto: true,
          thumbnailPath,
        }),
      ).toEqual({
        mediaSummary: { count: 1, types: ['PHOTO'] },
        legacyThumbnailPath: null,
        newSummaryIsMalformed: false,
      })
    },
  )
})
