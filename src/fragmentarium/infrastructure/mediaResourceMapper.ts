import {
  FragmentMedia,
  MediaReference,
  MediaResource,
  isMediaType,
} from 'fragmentarium/domain/media'
import {
  FragmentMediaResponseDto,
  MediaReferenceDto,
  MediaResourceDto,
} from './mediaDtos'
import { normalizeMediaRepresentations } from './mediaRepresentationMapper'
import {
  isRecord,
  normalizeNonEmptyString,
  normalizeNonNegativeInteger,
  normalizeOptionalText,
} from './mediaMapperValidation'

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
  const normalizedCaption = normalizeOptionalText(caption)
  const normalizedAttribution = normalizeOptionalText(attribution)

  if (!normalizedId || !isMediaType(type)) {
    return undefined
  }

  if (normalizedSortOrder === undefined || typeof isPrimary !== 'boolean') {
    return undefined
  }

  if (!normalizedRepresentations) {
    return undefined
  }

  return {
    id: normalizedId,
    type,
    sortOrder: normalizedSortOrder,
    isPrimary,
    ...(normalizedCaption ? { caption: normalizedCaption } : {}),
    ...(normalizedAttribution ? { attribution: normalizedAttribution } : {}),
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
