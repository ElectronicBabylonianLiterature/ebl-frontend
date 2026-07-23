import {
  MediaRepresentation,
  MediaRepresentations,
  ThumbnailSize,
  ThumbnailSizes,
  isThumbnailSize,
} from 'fragmentarium/domain/media'
import {
  MediaRepresentationDto,
  MediaRepresentationsDto,
  ThumbnailDtoMap,
} from './mediaDtos'
import {
  isRecord,
  normalizeNonEmptyString,
  normalizePositiveInteger,
} from './mediaMapperValidation'

export function normalizeUrl(value: unknown): string | undefined {
  return normalizeNonEmptyString(value)
}

export function normalizeMediaRepresentation(
  representation: unknown,
): MediaRepresentation | undefined {
  if (!isRecord(representation)) {
    return undefined
  }

  const { url, mimeType, width, height } =
    representation as MediaRepresentationDto
  const normalizedUrl = normalizeUrl(url)
  const normalizedMimeType = normalizeNonEmptyString(mimeType)

  if (!normalizedUrl || !normalizedMimeType) {
    return undefined
  }

  const normalizedWidth = normalizePositiveInteger(width)
  const normalizedHeight = normalizePositiveInteger(height)

  return {
    url: normalizedUrl,
    mimeType: normalizedMimeType,
    ...(normalizedWidth ? { width: normalizedWidth } : {}),
    ...(normalizedHeight ? { height: normalizedHeight } : {}),
  }
}

function normalizeThumbnailMap(
  thumbnails: unknown,
): Readonly<Partial<Record<ThumbnailSize, MediaRepresentation>>> {
  if (!isRecord(thumbnails)) {
    return {}
  }

  const normalizedThumbnails: Partial<
    Record<ThumbnailSize, MediaRepresentation>
  > = {}

  for (const thumbnailSize of ThumbnailSizes) {
    const thumbnail = normalizeMediaRepresentation(
      (thumbnails as ThumbnailDtoMap)[thumbnailSize],
    )
    if (thumbnail) {
      normalizedThumbnails[thumbnailSize] = thumbnail
    }
  }

  return normalizedThumbnails
}

export function normalizeMediaRepresentations(
  representations: unknown,
): MediaRepresentations | undefined {
  if (!isRecord(representations)) {
    return undefined
  }

  const { original, display, thumbnails } =
    representations as MediaRepresentationsDto
  const normalizedOriginal = normalizeMediaRepresentation(original)
  if (!normalizedOriginal) {
    return undefined
  }

  const normalizedDisplay = normalizeMediaRepresentation(display)

  return {
    original: normalizedOriginal,
    ...(normalizedDisplay ? { display: normalizedDisplay } : {}),
    thumbnails: normalizeThumbnailMap(thumbnails),
  }
}

export function normalizeThumbnailSize(
  value: unknown,
): ThumbnailSize | undefined {
  return isThumbnailSize(value) ? value : undefined
}
