import {
  MediaRepresentations,
  MediaType,
  OriginalMediaRepresentation,
  RasterMediaRepresentation,
  ThumbnailSize,
  ThumbnailSizes,
  isOriginalMediaMimeType,
  isRasterMediaMimeType,
  isSvgAllowedAsOriginal,
  isSvgMediaMimeType,
} from 'fragmentarium/domain/media'
import {
  MediaRepresentationDto,
  MediaRepresentationsDto,
  ThumbnailDtoMap,
} from 'fragmentarium/infrastructure/mediaDtos'
import {
  isRecord,
  normalizeNonEmptyString,
  normalizePositiveInteger,
  normalizeRelativeMediaUrl,
} from 'fragmentarium/infrastructure/mediaMapperValidation'

interface RepresentationFields {
  readonly url: string
  readonly mimeType: string
  readonly width?: number
  readonly height?: number
}

function normalizeRepresentationFields(
  representation: unknown,
): RepresentationFields | undefined {
  if (!isRecord(representation)) {
    return undefined
  }

  const { url, mimeType, width, height } =
    representation as MediaRepresentationDto
  const normalizedUrl = normalizeRelativeMediaUrl(url)
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

export function normalizeRasterRepresentation(
  representation: unknown,
): RasterMediaRepresentation | undefined {
  const fields = normalizeRepresentationFields(representation)
  if (!fields) {
    return undefined
  }

  const { mimeType, ...rest } = fields
  return isRasterMediaMimeType(mimeType) ? { ...rest, mimeType } : undefined
}

export function normalizeOriginalRepresentation(
  representation: unknown,
  mediaType: MediaType,
): OriginalMediaRepresentation | undefined {
  const fields = normalizeRepresentationFields(representation)
  if (!fields) {
    return undefined
  }

  const { mimeType, ...rest } = fields
  if (!isOriginalMediaMimeType(mimeType)) {
    return undefined
  }

  return isSvgMediaMimeType(mimeType) && !isSvgAllowedAsOriginal(mediaType)
    ? undefined
    : { ...rest, mimeType }
}

function normalizeThumbnailMap(
  thumbnails: unknown,
): Readonly<Partial<Record<ThumbnailSize, RasterMediaRepresentation>>> {
  if (!isRecord(thumbnails)) {
    return {}
  }

  const normalizedThumbnails: Partial<
    Record<ThumbnailSize, RasterMediaRepresentation>
  > = {}

  for (const thumbnailSize of ThumbnailSizes) {
    const thumbnail = normalizeRasterRepresentation(
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
  mediaType: MediaType,
): MediaRepresentations | undefined {
  if (!isRecord(representations)) {
    return undefined
  }

  const { original, display, thumbnails } =
    representations as MediaRepresentationsDto
  const normalizedOriginal = normalizeOriginalRepresentation(
    original,
    mediaType,
  )
  if (!normalizedOriginal) {
    return undefined
  }

  const normalizedDisplay = normalizeRasterRepresentation(display)

  return {
    original: normalizedOriginal,
    ...(normalizedDisplay ? { display: normalizedDisplay } : {}),
    thumbnails: normalizeThumbnailMap(thumbnails),
  }
}
