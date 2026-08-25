import {
  MediaSummary,
  MediaSummaryPrimary,
  MediaType,
  isMediaType,
} from 'fragmentarium/domain/media'
import {
  MediaSummaryCompatibilityDto,
  MediaSummaryDto,
  MediaSummaryPrimaryDto,
} from 'fragmentarium/infrastructure/mediaDtos'
import { normalizeRasterRepresentation } from 'fragmentarium/infrastructure/mediaRepresentationMapper'
import {
  isRecord,
  normalizeNonEmptyString,
  normalizeNonNegativeInteger,
  normalizeRelativeMediaUrl,
} from 'fragmentarium/infrastructure/mediaMapperValidation'

export interface NormalizedMediaSummaryCompatibility {
  readonly mediaSummary: MediaSummary | null
  readonly legacyThumbnailPath: string | null
}

interface MediaSummaryNormalizationResult {
  readonly mediaSummary: MediaSummary | null
  readonly hasCriticalError: boolean
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

  const normalizedThumbnail = normalizeRasterRepresentation(thumbnail)
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
  if (normalizedPrimary && !normalizedTypes.includes(normalizedPrimary.type)) {
    normalizedTypes.push(normalizedPrimary.type)
  }

  const hasCriticalError =
    (primary !== undefined && primary !== null && normalizedCount === 0) ||
    (normalizedCount > 0 && normalizedTypes.length === 0)

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

function normalizeLegacyThumbnailPath(thumbnailPath: unknown): string | null {
  return normalizeRelativeMediaUrl(thumbnailPath) ?? null
}

function hasPrimaryThumbnail(mediaSummary: MediaSummary): boolean {
  return mediaSummary.primary?.thumbnail !== undefined
}

export function normalizeMediaSummary(
  mediaSummary: unknown,
): MediaSummary | null {
  const normalized = normalizeMediaSummaryWithDiagnostics(mediaSummary)
  return normalized.hasCriticalError ? null : normalized.mediaSummary
}

export function normalizeLegacyMediaSummary(
  hasPhoto: unknown,
  thumbnailPath?: unknown,
): NormalizedMediaSummaryCompatibility {
  return {
    mediaSummary: hasPhoto === true ? createLegacyPhotoSummary() : null,
    legacyThumbnailPath: normalizeLegacyThumbnailPath(thumbnailPath),
  }
}

export function normalizeCompatibleMediaSummary(
  compatibility: MediaSummaryCompatibilityDto | null | undefined,
): NormalizedMediaSummaryCompatibility {
  const normalizedNewSummary = normalizeMediaSummaryWithDiagnostics(
    compatibility?.mediaSummary,
  )

  const normalizedLegacySummary = normalizeLegacyMediaSummary(
    compatibility?.hasPhoto,
    compatibility?.thumbnailPath,
  )

  if (
    normalizedNewSummary.mediaSummary &&
    !normalizedNewSummary.hasCriticalError
  ) {
    return {
      mediaSummary: normalizedNewSummary.mediaSummary,
      legacyThumbnailPath: hasPrimaryThumbnail(
        normalizedNewSummary.mediaSummary,
      )
        ? null
        : normalizedLegacySummary.legacyThumbnailPath,
    }
  }

  return normalizedLegacySummary.mediaSummary
    ? normalizedLegacySummary
    : {
        mediaSummary: null,
        legacyThumbnailPath: normalizedLegacySummary.legacyThumbnailPath,
      }
}
