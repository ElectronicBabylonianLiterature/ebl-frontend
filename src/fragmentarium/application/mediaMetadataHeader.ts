import type { MediaUploadMetadata } from 'fragmentarium/application/MediaManagementRepository'

/**
 * The API rejects an upload (413) when the URI-encoded `X-Media-Metadata`
 * header is longer than this many characters.
 */
export const MEDIA_METADATA_HEADER_LIMIT = 16384

export const MEDIA_METADATA_TOO_LONG_MESSAGE =
  "This image's metadata is too long to upload. Shorten the description, caption or other text fields."

export function encodeMediaMetadataHeader(
  metadata: MediaUploadMetadata,
  originalFilename: string,
): string {
  return encodeURIComponent(JSON.stringify({ ...metadata, originalFilename }))
}

export function mediaMetadataFitsHeader(
  metadata: MediaUploadMetadata,
  originalFilename: string,
): boolean {
  return (
    encodeMediaMetadataHeader(metadata, originalFilename).length <=
    MEDIA_METADATA_HEADER_LIMIT
  )
}
