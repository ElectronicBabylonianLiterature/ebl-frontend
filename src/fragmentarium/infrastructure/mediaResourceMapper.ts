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
} from 'fragmentarium/infrastructure/mediaDtos'
import { normalizeMediaRepresentations } from 'fragmentarium/infrastructure/mediaRepresentationMapper'
import {
  isRecord,
  normalizeNonEmptyString,
  normalizeNonNegativeInteger,
} from 'fragmentarium/infrastructure/mediaMapperValidation'

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

function normalizeMediaReferences(
  references: unknown,
): readonly MediaReference[] {
  return Array.isArray(references)
    ? references
        .map((reference) => normalizeMediaReference(reference))
        .filter((reference): reference is MediaReference => Boolean(reference))
    : []
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
  if (!normalizedId || !isMediaType(type)) {
    return undefined
  }

  const normalizedSortOrder = normalizeNonNegativeInteger(sortOrder)
  if (normalizedSortOrder === undefined || typeof isPrimary !== 'boolean') {
    return undefined
  }

  const normalizedRepresentations = normalizeMediaRepresentations(
    representations,
    type,
  )
  if (!normalizedRepresentations) {
    return undefined
  }

  const normalizedCaption = normalizeNonEmptyString(caption)
  const normalizedAttribution = normalizeNonEmptyString(attribution)
  const lifecycle = normalizeLifecycle(resource)
  if (!lifecycle) return undefined

  return {
    id: normalizedId,
    type,
    sortOrder: normalizedSortOrder,
    isPrimary,
    ...(normalizedCaption ? { caption: normalizedCaption } : {}),
    ...(normalizedAttribution ? { attribution: normalizedAttribution } : {}),
    references: normalizeMediaReferences(references),
    representations: normalizedRepresentations,
    ...lifecycle,
  }
}

function normalizeLifecycle(
  resource: Record<string, unknown>,
): Partial<MediaResource> | undefined {
  if (resource.publicationStatus === undefined) {
    if (resource.rightsAnnotated !== true) return {}
    const rights: Partial<MediaResource> = { rightsAnnotated: true }
    for (const field of [
      'creator',
      'sourceInstitution',
      'copyrightHolder',
      'rightsStatement',
      'description',
    ] as const) {
      if (typeof resource[field] === 'string')
        Object.assign(rights, { [field]: resource[field] })
    }
    return rights
  }
  const result: Record<string, unknown> = {}
  if (resource.publicationStatus !== undefined) {
    if (
      typeof resource.publicationStatus !== 'string' ||
      !['PENDING_REVIEW', 'PUBLISHED', 'REJECTED'].includes(
        resource.publicationStatus,
      )
    )
      return undefined
    result.publicationStatus = resource.publicationStatus
  }
  for (const field of [
    'uploaderId',
    'uploadedAt',
    'reviewerId',
    'reviewedAt',
    'reviewReason',
    'originalFilename',
    'creator',
    'sourceInstitution',
    'copyrightHolder',
    'rightsStatement',
    'description',
  ]) {
    if (typeof resource[field] === 'string') result[field] = resource[field]
  }
  if (typeof resource.permissionAttested === 'boolean')
    result.permissionAttested = resource.permissionAttested
  if (
    Array.isArray(resource.projects) &&
    resource.projects.every((project) => typeof project === 'string')
  )
    result.projects = resource.projects
  return result as Partial<MediaResource>
}

export function normalizeFragmentMediaResponse(
  response: FragmentMediaResponseDto | null | undefined,
): FragmentMedia {
  const media = Array.isArray(response?.media) ? response.media : []
  const hasUnrecognizedMedia = media.some(
    (resource) =>
      isRecord(resource) &&
      typeof (resource as MediaResourceDto).type === 'string' &&
      !isMediaType((resource as MediaResourceDto).type),
  )

  return {
    media: media
      .map((resource) => normalizeMediaResource(resource))
      .filter((resource): resource is MediaResource => Boolean(resource)),
    hasUnrecognizedMedia,
  }
}
