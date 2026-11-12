import {
  encodeMediaMetadataHeader,
  MEDIA_METADATA_HEADER_LIMIT,
  mediaMetadataFitsHeader,
} from './mediaMetadataHeader'
import type { MediaUploadMetadata } from './MediaManagementRepository'

const metadata: MediaUploadMetadata = {
  type: 'PHOTO',
  caption: 'Obverse',
  sourceInstitution: 'Museum',
  rightsStatement: 'Permission granted',
  permissionAttested: true,
}

test('the limit matches the API contract', () => {
  expect(MEDIA_METADATA_HEADER_LIMIT).toBe(16384)
})

test('encodes the metadata with the original filename as URI-encoded JSON', () => {
  const header = encodeMediaMetadataHeader(metadata, 'tablet š.jpg')
  expect(header).toBe(
    encodeURIComponent(
      JSON.stringify({ ...metadata, originalFilename: 'tablet š.jpg' }),
    ),
  )
  expect(JSON.parse(decodeURIComponent(header))).toEqual({
    ...metadata,
    originalFilename: 'tablet š.jpg',
  })
})

test('ASCII text at the form maximum fits under the limit', () => {
  const long = 'a'.repeat(2000)
  expect(
    mediaMetadataFitsHeader(
      { ...metadata, caption: long, description: long },
      'tablet.jpg',
    ),
  ).toBe(true)
})

test('diacritics expand when percent-encoded and push the same length over the limit', () => {
  const ascii = 'sa'.repeat(1000)
  const transliteration = 'šá'.repeat(1000)
  const asciiMetadata = {
    ...metadata,
    caption: ascii,
    description: ascii,
    creator: ascii,
  }
  const transliteratedMetadata = {
    ...metadata,
    caption: transliteration,
    description: transliteration,
    creator: transliteration,
  }
  expect(mediaMetadataFitsHeader(asciiMetadata, 'tablet.jpg')).toBe(true)
  expect(mediaMetadataFitsHeader(transliteratedMetadata, 'tablet.jpg')).toBe(
    false,
  )
  expect(
    encodeMediaMetadataHeader(transliteratedMetadata, 'tablet.jpg').length,
  ).toBeGreaterThan(MEDIA_METADATA_HEADER_LIMIT)
})

test('a header of exactly the limit fits and one character more does not', () => {
  const base = encodeMediaMetadataHeader(
    { ...metadata, description: '' },
    'a.jpg',
  ).length
  const exact = { ...metadata, description: 'a'.repeat(16384 - base) }
  expect(encodeMediaMetadataHeader(exact, 'a.jpg')).toHaveLength(16384)
  expect(mediaMetadataFitsHeader(exact, 'a.jpg')).toBe(true)
  expect(
    mediaMetadataFitsHeader(
      { ...exact, description: `${exact.description}a` },
      'a.jpg',
    ),
  ).toBe(false)
})
