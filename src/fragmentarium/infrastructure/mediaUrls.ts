import type { ThumbnailSize } from 'fragmentarium/domain/media'
import type {
  MediaBinaryRepresentation,
  MediaBinaryRequest,
} from 'fragmentarium/application/MediaBinaryLoader'

function segment(value: string): string {
  return encodeURIComponent(value)
}

function fragmentMediaBase(fragmentNumber: string, mediaId: string): string {
  return `/fragments/${segment(fragmentNumber)}/media/${segment(mediaId)}`
}

export function fragmentMediaOriginalUrl(
  fragmentNumber: string,
  mediaId: string,
): string {
  return `${fragmentMediaBase(fragmentNumber, mediaId)}/file`
}

export function fragmentMediaDisplayUrl(
  fragmentNumber: string,
  mediaId: string,
): string {
  return `${fragmentMediaBase(fragmentNumber, mediaId)}/display`
}

export function fragmentMediaThumbnailUrl(
  fragmentNumber: string,
  mediaId: string,
  size: ThumbnailSize,
): string {
  const base = fragmentMediaBase(fragmentNumber, mediaId)
  return `${base}/thumbnail/${segment(size)}`
}

function resolveBinaryUrl(
  fragmentNumber: string,
  mediaId: string,
  representation: MediaBinaryRepresentation,
): string {
  if (representation === 'original') {
    return fragmentMediaOriginalUrl(fragmentNumber, mediaId)
  }

  return representation === 'display'
    ? fragmentMediaDisplayUrl(fragmentNumber, mediaId)
    : fragmentMediaThumbnailUrl(fragmentNumber, mediaId, representation)
}

export function fragmentMediaBinaryUrl({
  fragmentNumber,
  mediaId,
  representation,
}: MediaBinaryRequest): string {
  return resolveBinaryUrl(fragmentNumber, mediaId, representation)
}
