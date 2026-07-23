import {
  isMediaType,
  isThumbnailSize,
  MediaTypes,
  ThumbnailSizes,
} from './media'

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
