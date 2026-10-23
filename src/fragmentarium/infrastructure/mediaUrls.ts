import type { ThumbnailSize } from 'fragmentarium/domain/media'
import type {
  MediaBinaryRepresentation,
  MediaBinaryRequest,
} from 'fragmentarium/application/MediaBinaryLoader'

function segment(value: string): string {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  )
}

function fragmentQuery(fragmentNumber: string): string {
  return `?fragment=${segment(fragmentNumber)}`
}

export function fragmentMediaListUrl(fragmentNumber: string): string {
  return `/media${fragmentQuery(fragmentNumber)}`
}

function fragmentMediaBase(mediaId: string): string {
  return `/media/${segment(mediaId)}`
}

export function fragmentMediaOriginalUrl(
  fragmentNumber: string,
  mediaId: string,
): string {
  return `${fragmentMediaBase(mediaId)}/file${fragmentQuery(fragmentNumber)}`
}

export function fragmentMediaDisplayUrl(
  fragmentNumber: string,
  mediaId: string,
): string {
  return `${fragmentMediaBase(mediaId)}/display${fragmentQuery(fragmentNumber)}`
}

export function fragmentMediaThumbnailUrl(
  fragmentNumber: string,
  mediaId: string,
  size: ThumbnailSize,
): string {
  const base = fragmentMediaBase(mediaId)
  return `${base}/thumbnail/${segment(size)}${fragmentQuery(fragmentNumber)}`
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
