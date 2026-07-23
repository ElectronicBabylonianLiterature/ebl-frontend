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
} from './mediaDtos'
import {
  normalizeMediaRepresentation,
  normalizeUrl,
} from './mediaRepresentationMapper'
import {
  isRecord,
  normalizeNonEmptyString,
  normalizeNonNegativeInteger,
} from './mediaMapperValidation'

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
