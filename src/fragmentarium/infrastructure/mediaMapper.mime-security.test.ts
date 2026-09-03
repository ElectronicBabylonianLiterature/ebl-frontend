import { normalizeMediaResource } from 'fragmentarium/infrastructure/mediaMapper'
import { RasterMediaMimeTypes } from 'fragmentarium/domain/media'
import type { MediaType } from 'fragmentarium/domain/media'
import {
  fragmentMediaDisplayUrl,
  fragmentMediaOriginalUrl,
  fragmentMediaThumbnailUrl,
} from 'fragmentarium/infrastructure/mediaUrls'

const originalUrl = fragmentMediaOriginalUrl('K.1', 'media-id')
const displayUrl = fragmentMediaDisplayUrl('K.1', 'media-id')
const thumbnailUrl = fragmentMediaThumbnailUrl('K.1', 'media-id', 'small')

function resourceWith(
  type: MediaType,
  representations: Record<string, unknown>,
): unknown {
  return {
    id: 'media-id',
    type,
    sortOrder: 0,
    isPrimary: true,
    representations,
  }
}

describe('original representation mime policy', () => {
  test.each(RasterMediaMimeTypes)(
    'accepts raster original %s for PHOTO',
    (mimeType) => {
      expect(
        normalizeMediaResource(
          resourceWith('PHOTO', {
            original: { url: originalUrl, mimeType },
          }),
        ),
      ).toMatchObject({
        representations: { original: { mimeType } },
      })
    },
  )

  test('accepts an SVG original for COPY', () => {
    expect(
      normalizeMediaResource(
        resourceWith('COPY', {
          original: { url: originalUrl, mimeType: 'image/svg+xml' },
        }),
      ),
    ).toMatchObject({
      type: 'COPY',
      representations: { original: { mimeType: 'image/svg+xml' } },
    })
  })

  test('rejects an SVG original for PHOTO', () => {
    expect(
      normalizeMediaResource(
        resourceWith('PHOTO', {
          original: { url: originalUrl, mimeType: 'image/svg+xml' },
        }),
      ),
    ).toBeUndefined()
  })

  test.each([
    'image/gif',
    'image/tiff',
    'application/pdf',
    'text/html',
    'IMAGE/JPEG',
    'image/jpeg; charset=utf-8',
  ])('rejects unsupported original mime %p', (mimeType) => {
    expect(
      normalizeMediaResource(
        resourceWith('COPY', { original: { url: originalUrl, mimeType } }),
      ),
    ).toBeUndefined()
  })
})

describe('preview representations are raster only', () => {
  test('drops an SVG display from a COPY resource', () => {
    expect(
      normalizeMediaResource(
        resourceWith('COPY', {
          original: { url: originalUrl, mimeType: 'image/svg+xml' },
          display: { url: displayUrl, mimeType: 'image/svg+xml' },
        }),
      ),
    ).toMatchObject({
      representations: {
        original: { mimeType: 'image/svg+xml' },
        thumbnails: {},
      },
    })
  })

  test('keeps a raster display alongside an SVG original', () => {
    expect(
      normalizeMediaResource(
        resourceWith('COPY', {
          original: { url: originalUrl, mimeType: 'image/svg+xml' },
          display: { url: displayUrl, mimeType: 'image/png' },
        }),
      ),
    ).toMatchObject({
      representations: {
        original: { mimeType: 'image/svg+xml' },
        display: { url: displayUrl, mimeType: 'image/png' },
      },
    })
  })

  test.each(['PHOTO', 'COPY'] as const)(
    'drops an SVG thumbnail from a %s resource',
    (type) => {
      const mediaResource = normalizeMediaResource(
        resourceWith(type, {
          original: {
            url: originalUrl,
            mimeType: type === 'COPY' ? 'image/svg+xml' : 'image/png',
          },
          thumbnails: {
            small: { url: thumbnailUrl, mimeType: 'image/svg+xml' },
          },
        }),
      )

      expect(mediaResource?.representations.thumbnails).toEqual({})
    },
  )

  test('drops an unsupported display mime without rejecting the resource', () => {
    expect(
      normalizeMediaResource(
        resourceWith('PHOTO', {
          original: { url: originalUrl, mimeType: 'image/png' },
          display: { url: displayUrl, mimeType: 'application/pdf' },
        }),
      ),
    ).toMatchObject({
      representations: { original: { mimeType: 'image/png' }, thumbnails: {} },
    })
  })
})
