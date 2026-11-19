import {
  fragmentMediaBinaryUrl,
  fragmentMediaListUrl,
  fragmentMediaDisplayUrl,
  fragmentMediaOriginalUrl,
  fragmentMediaThumbnailUrl,
} from 'fragmentarium/infrastructure/mediaUrls'
import { ThumbnailSizes } from 'fragmentarium/domain/media'
import { normalizeRelativeMediaUrl } from 'fragmentarium/infrastructure/mediaMapperValidation'

const fragmentNumber = 'K.1'
const mediaId = '550e8400-e29b-41d4-a716-446655440000'

describe('fragment-scoped media binary routes', () => {
  test('builds the original route', () => {
    expect(fragmentMediaOriginalUrl(fragmentNumber, mediaId)).toBe(
      `/media/${mediaId}/file?fragment=K.1`,
    )
  })

  test('builds the display route', () => {
    expect(fragmentMediaDisplayUrl(fragmentNumber, mediaId)).toBe(
      `/media/${mediaId}/display?fragment=K.1`,
    )
  })

  test.each(ThumbnailSizes)('builds the %s thumbnail route', (size) => {
    expect(fragmentMediaThumbnailUrl(fragmentNumber, mediaId, size)).toBe(
      `/media/${mediaId}/thumbnail/${size}?fragment=K.1`,
    )
  })
})

describe('route segment encoding', () => {
  test.each([
    ['K.1/2', 'K.1%2F2'],
    ['K 1', 'K%201'],
    ['K?1', 'K%3F1'],
    ['K#1', 'K%231'],
    ['K%1', 'K%251'],
    ['K1', 'K1'],
    ['Ištar', 'I%C5%A1tar'],
    ["A!'()*.1", 'A%21%27%28%29%2A.1'],
  ])('encodes fragment number %p as %p', (rawNumber, encoded) => {
    expect(fragmentMediaOriginalUrl(rawNumber, mediaId)).toBe(
      `/media/${mediaId}/file?fragment=${encoded}`,
    )
  })

  test('encodes the media id as a single path segment', () => {
    expect(fragmentMediaDisplayUrl(fragmentNumber, 'a/b?c#d')).toBe(
      '/media/a%2Fb%3Fc%23d/display?fragment=K.1',
    )
  })

  test.each([
    'K.1/2',
    'K 1',
    'K?1',
    'K#1',
    '//evil.example',
    'https://evil.example',
  ])(
    'produces a trusted same-origin relative path for fragment number %p',
    (rawNumber) => {
      const url = fragmentMediaOriginalUrl(rawNumber, mediaId)
      expect(normalizeRelativeMediaUrl(url)).toBe(url)
    },
  )

  test('does not trust an encoded traversal fragment number', () => {
    const url = fragmentMediaOriginalUrl('../admin', mediaId)

    expect(url).toContain('..%2Fadmin')
    expect(normalizeRelativeMediaUrl(url)).toBeUndefined()
  })
})

describe('binary request routing', () => {
  test('routes an original request', () => {
    expect(
      fragmentMediaBinaryUrl({
        fragmentNumber,
        mediaId,
        representation: 'original',
      }),
    ).toBe(`/media/${mediaId}/file?fragment=K.1`)
  })

  test('routes a display request', () => {
    expect(
      fragmentMediaBinaryUrl({
        fragmentNumber,
        mediaId,
        representation: 'display',
      }),
    ).toBe(`/media/${mediaId}/display?fragment=K.1`)
  })

  test.each(ThumbnailSizes)('routes a %s thumbnail request', (size) => {
    expect(
      fragmentMediaBinaryUrl({
        fragmentNumber,
        mediaId,
        representation: size,
      }),
    ).toBe(`/media/${mediaId}/thumbnail/${size}?fragment=K.1`)
  })
})

test('builds the fragment-scoped media listing route', () => {
  expect(fragmentMediaListUrl('K.1/2')).toBe('/media?fragment=K.1%2F2')
})
