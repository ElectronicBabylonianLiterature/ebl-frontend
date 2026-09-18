import {
  MediaTypes,
  RasterMediaMimeTypes,
  SvgMediaMimeType,
  ThumbnailSizes,
  isMediaType,
  isOriginalMediaMimeType,
  isRasterMediaMimeType,
  isSvgAllowedAsOriginal,
  isSvgMediaMimeType,
  isThumbnailSize,
} from 'fragmentarium/domain/media'

const unsupportedMimeTypes = [
  'image/gif',
  'image/tiff',
  'application/pdf',
  'text/html',
  'IMAGE/JPEG',
  'image/jpeg; charset=utf-8',
  '',
  null,
  1,
]

test.each(MediaTypes)('accepts media type %s', (mediaType) => {
  expect(isMediaType(mediaType)).toBe(true)
})

test.each(['', 'photo', 'SVG', 'COPY ', null, 1])(
  'rejects invalid media type %p',
  (value) => {
    expect(isMediaType(value)).toBe(false)
  },
)

test.each(ThumbnailSizes)('accepts thumbnail size %s', (thumbnailSize) => {
  expect(isThumbnailSize(thumbnailSize)).toBe(true)
})

test.each(['', 'Small', 'x-large', null, 1])(
  'rejects invalid thumbnail size %p',
  (value) => {
    expect(isThumbnailSize(value)).toBe(false)
  },
)

test.each(RasterMediaMimeTypes)('accepts raster mime type %s', (mimeType) => {
  expect(isRasterMediaMimeType(mimeType)).toBe(true)
  expect(isOriginalMediaMimeType(mimeType)).toBe(true)
  expect(isSvgMediaMimeType(mimeType)).toBe(false)
})

test('treats SVG as an original-only mime type', () => {
  expect(isSvgMediaMimeType(SvgMediaMimeType)).toBe(true)
  expect(isOriginalMediaMimeType(SvgMediaMimeType)).toBe(true)
  expect(isRasterMediaMimeType(SvgMediaMimeType)).toBe(false)
})

test.each(unsupportedMimeTypes)('rejects unsupported mime type %p', (value) => {
  expect(isRasterMediaMimeType(value)).toBe(false)
  expect(isOriginalMediaMimeType(value)).toBe(false)
  expect(isSvgMediaMimeType(value)).toBe(false)
})

test('allows SVG originals only for hand copies', () => {
  expect(isSvgAllowedAsOriginal('COPY')).toBe(true)
  expect(isSvgAllowedAsOriginal('PHOTO')).toBe(false)
})
