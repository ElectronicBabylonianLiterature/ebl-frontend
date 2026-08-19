import {
  fragmentMediaBinaryUrl,
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
      `/fragments/K.1/media/${mediaId}/file`,
    )
  })

  test('builds the display route', () => {
    expect(fragmentMediaDisplayUrl(fragmentNumber, mediaId)).toBe(
      `/fragments/K.1/media/${mediaId}/display`,
    )
  })

  test.each(ThumbnailSizes)('builds the %s thumbnail route', (size) => {
    expect(fragmentMediaThumbnailUrl(fragmentNumber, mediaId, size)).toBe(
      `/fragments/K.1/media/${mediaId}/thumbnail/${size}`,
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
  ])('encodes fragment number %p as %p', (rawNumber, encoded) => {
    expect(fragmentMediaOriginalUrl(rawNumber, mediaId)).toBe(
      `/fragments/${encoded}/media/${mediaId}/file`,
    )
  })

  test('encodes the media id as a single path segment', () => {
    expect(fragmentMediaDisplayUrl(fragmentNumber, 'a/b?c#d')).toBe(
      '/fragments/K.1/media/a%2Fb%3Fc%23d/display',
    )
  })

  test.each([
    'K.1/2',
    'K 1',
    'K?1',
    'K#1',
    '../admin',
    '//evil.example',
    'https://evil.example',
  ])(
    'produces a trusted same-origin relative path for fragment number %p',
    (rawNumber) => {
      const url = fragmentMediaOriginalUrl(rawNumber, mediaId)
      expect(normalizeRelativeMediaUrl(url)).toBe(url)
    },
  )
})

describe('binary request routing', () => {
  test('routes an original request', () => {
    expect(
      fragmentMediaBinaryUrl({
        fragmentNumber,
        mediaId,
        representation: 'original',
      }),
    ).toBe(`/fragments/K.1/media/${mediaId}/file`)
  })

  test('routes a display request', () => {
    expect(
      fragmentMediaBinaryUrl({
        fragmentNumber,
        mediaId,
        representation: 'display',
      }),
    ).toBe(`/fragments/K.1/media/${mediaId}/display`)
  })

  test.each(ThumbnailSizes)('routes a %s thumbnail request', (size) => {
    expect(
      fragmentMediaBinaryUrl({
        fragmentNumber,
        mediaId,
        representation: size,
      }),
    ).toBe(`/fragments/K.1/media/${mediaId}/thumbnail/${size}`)
  })
})
