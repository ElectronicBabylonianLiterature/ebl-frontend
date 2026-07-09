import {
  FragmentMedia,
  MediaReference,
  MediaRepresentation,
  MediaRepresentations,
  MediaResource,
  MediaSummary,
  MediaSummaryPrimary,
  MediaType,
  ThumbnailSize,
  ThumbnailSizes,
  isMediaType,
  isThumbnailSize,
} from 'fragmentarium/domain/media'
import {
  FragmentMediaResponseDto,
  MediaReferenceDto,
  MediaRepresentationDto,
  MediaRepresentationsDto,
  MediaResourceDto,
  MediaSummaryCompatibilityDto,
  MediaSummaryDto,
  MediaSummaryPrimaryDto,
  ThumbnailDtoMap,
} from './mediaDtos'

export interface NormalizedMediaSummaryCompatibility {
  readonly mediaSummary: MediaSummary | null
  readonly legacyThumbnailPath: string | null
}

interface MediaSummaryNormalizationResult {
  readonly mediaSummary: MediaSummary | null
  readonly hasCriticalError: boolean
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizeNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const normalizedValue = value.trim()
  return normalizedValue === '' ? undefined : normalizedValue
}

function normalizeNonNegativeInteger(value: unknown): number | undefined {
  return Number.isInteger(value) && (value as number) >= 0
    ? (value as number)
    : undefined
}

function normalizePositiveInteger(value: unknown): number | undefined {
  return Number.isInteger(value) && (value as number) > 0
    ? (value as number)
    : undefined
}

function normalizeMediaTypes(values: readonly unknown[]): readonly MediaType[] {
  const mediaTypes = values.filter(isMediaType)
  return Array.from(new Set(mediaTypes))
}

function normalizeMediaSummaryPrimaryInternal(
  primary: unknown,
): MediaSummaryPrimary | undefined {
  if (!isRecord(primary)) {
    return undefined
  }

  const { id, type, thumbnail } = primary as MediaSummaryPrimaryDto
  const normalizedId = normalizeNonEmptyString(id)
  if (!normalizedId || !isMediaType(type)) {
    return undefined
  }

  const normalizedThumbnail = normalizeMediaRepresentation(thumbnail)
  return normalizedThumbnail
    ? {
        id: normalizedId,
        type,
        thumbnail: normalizedThumbnail,
      }
    : {
        id: normalizedId,
        type,
      }
}

function normalizeMediaSummaryWithDiagnostics(
  mediaSummary: unknown,
): MediaSummaryNormalizationResult {
  if (!isRecord(mediaSummary)) {
    return { mediaSummary: null, hasCriticalError: true }
  }

  const { count, types, primary } = mediaSummary as MediaSummaryDto
  const normalizedCount = normalizeNonNegativeInteger(count)
  if (normalizedCount === undefined || !Array.isArray(types)) {
    return { mediaSummary: null, hasCriticalError: true }
  }

  const normalizedPrimary = normalizeMediaSummaryPrimaryInternal(primary)
  const normalizedTypes = Array.from(normalizeMediaTypes(types))
  if (
    normalizedPrimary &&
    !normalizedTypes.includes(normalizedPrimary.type as MediaType)
  ) {
    normalizedTypes.push(normalizedPrimary.type)
  }

  const hasCriticalError =
    (primary !== undefined && primary !== null && normalizedCount === 0) ||
    (normalizedCount > 0 && normalizedTypes.length === 0 && !normalizedPrimary)

  if (normalizedCount === 0) {
    return {
      mediaSummary: { count: 0, types: [] },
      hasCriticalError,
    }
  }

  return {
    mediaSummary: normalizedPrimary
      ? {
          count: normalizedCount,
          types: normalizedTypes,
          primary: normalizedPrimary,
        }
      : {
          count: normalizedCount,
          types: normalizedTypes,
        },
    hasCriticalError,
  }
}

function createLegacyPhotoSummary(): MediaSummary {
  return {
    count: 1,
    types: ['PHOTO'],
  }
}

function normalizeLegacyMediaSummaryWithThumbnail(
  thumbnailPath: unknown,
): NormalizedMediaSummaryCompatibility {
  return {
    mediaSummary: createLegacyPhotoSummary(),
    legacyThumbnailPath: normalizeUrl(thumbnailPath) ?? null,
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

function normalizeOptionalText(value: unknown): string | undefined {
  return normalizeNonEmptyString(value)
}

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

export function normalizeMediaReference(
  reference: unknown,
): MediaReference | undefined {
  if (!isRecord(reference)) {
    return undefined
  }

  const normalizedId = normalizeNonEmptyString(
    (reference as MediaReferenceDto).id,
  )
  return normalizedId ? { id: normalizedId } : undefined
}

export function normalizeMediaSummary(
  mediaSummary: unknown,
): MediaSummary | null {
  return normalizeMediaSummaryWithDiagnostics(mediaSummary).mediaSummary
}

export function normalizeLegacyMediaSummary(
  hasPhoto: unknown,
  thumbnailPath?: unknown,
): NormalizedMediaSummaryCompatibility {
  if (hasPhoto !== true) {
    return {
      mediaSummary: null,
      legacyThumbnailPath: null,
    }
  }

  return thumbnailPath === undefined
    ? {
        mediaSummary: createLegacyPhotoSummary(),
        legacyThumbnailPath: null,
      }
    : normalizeLegacyMediaSummaryWithThumbnail(thumbnailPath)
}

export function normalizeCompatibleMediaSummary(
  compatibility: MediaSummaryCompatibilityDto | null | undefined,
): NormalizedMediaSummaryCompatibility {
  const normalizedNewSummary = normalizeMediaSummaryWithDiagnostics(
    compatibility?.mediaSummary,
  )

  if (
    normalizedNewSummary.mediaSummary &&
    !normalizedNewSummary.hasCriticalError
  ) {
    return {
      mediaSummary: normalizedNewSummary.mediaSummary,
      legacyThumbnailPath: null,
    }
  }

  const normalizedLegacySummary = normalizeLegacyMediaSummary(
    compatibility?.hasPhoto,
    compatibility?.thumbnailPath,
  )

  return normalizedLegacySummary.mediaSummary
    ? normalizedLegacySummary
    : {
        mediaSummary: normalizedNewSummary.mediaSummary,
        legacyThumbnailPath: null,
      }
}

export function normalizeMediaResource(
  resource: unknown,
): MediaResource | undefined {
  if (!isRecord(resource)) {
    return undefined
  }

  const {
    id,
    type,
    sortOrder,
    isPrimary,
    caption,
    attribution,
    references,
    representations,
  } = resource as MediaResourceDto

  const normalizedId = normalizeNonEmptyString(id)
  const normalizedSortOrder = normalizeNonNegativeInteger(sortOrder)
  const normalizedRepresentations =
    normalizeMediaRepresentations(representations)

  if (
    !normalizedId ||
    !isMediaType(type) ||
    normalizedSortOrder === undefined ||
    typeof isPrimary !== 'boolean' ||
    !normalizedRepresentations
  ) {
    return undefined
  }

  return {
    id: normalizedId,
    type,
    sortOrder: normalizedSortOrder,
    isPrimary,
    ...(normalizeOptionalText(caption)
      ? { caption: normalizeOptionalText(caption) }
      : {}),
    ...(normalizeOptionalText(attribution)
      ? { attribution: normalizeOptionalText(attribution) }
      : {}),
    references: Array.isArray(references)
      ? references
          .map((reference) => normalizeMediaReference(reference))
          .filter((reference): reference is MediaReference =>
            Boolean(reference),
          )
      : [],
    representations: normalizedRepresentations,
  }
}

export function normalizeFragmentMediaResponse(
  response: FragmentMediaResponseDto | null | undefined,
): FragmentMedia {
  const media = Array.isArray(response?.media) ? response.media : []

  return {
    media: media
      .map((resource) => normalizeMediaResource(resource))
      .filter((resource): resource is MediaResource => Boolean(resource)),
  }
}

export function normalizeThumbnailSize(
  value: unknown,
): ThumbnailSize | undefined {
  return isThumbnailSize(value) ? value : undefined
}
