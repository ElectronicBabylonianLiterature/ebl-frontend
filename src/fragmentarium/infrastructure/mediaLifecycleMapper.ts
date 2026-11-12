import type { MediaResource } from 'fragmentarium/domain/media'

const rightsFields = [
  'creator',
  'sourceInstitution',
  'copyrightHolder',
  'rightsStatement',
  'description',
] as const
const reviewFields = [
  'uploaderId',
  'uploadedAt',
  'reviewerId',
  'reviewedAt',
  'reviewReason',
  'originalFilename',
] as const

function stringFields(
  resource: Record<string, unknown>,
  fields: readonly string[],
): Partial<MediaResource> {
  return Object.fromEntries(
    fields
      .filter((field) => typeof resource[field] === 'string')
      .map((field) => [field, resource[field]]),
  )
}

function legacyRights(
  resource: Record<string, unknown>,
): Partial<MediaResource> {
  return resource.rightsAnnotated === true
    ? { rightsAnnotated: true, ...stringFields(resource, rightsFields) }
    : {}
}

function projects(resource: Record<string, unknown>): Partial<MediaResource> {
  return Array.isArray(resource.projects) &&
    resource.projects.every((project) => typeof project === 'string')
    ? { projects: resource.projects }
    : {}
}

function revision(resource: Record<string, unknown>): Partial<MediaResource> {
  const value = resource.revision
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
    ? { revision: value }
    : {}
}

function validPublicationStatus(
  value: unknown,
): value is MediaResource['publicationStatus'] {
  return (
    typeof value === 'string' &&
    ['PENDING_REVIEW', 'PUBLISHED', 'REJECTED'].includes(value)
  )
}

export function normalizeLifecycle(
  resource: Record<string, unknown>,
): Partial<MediaResource> | undefined {
  if (resource.publicationStatus === undefined)
    return { ...legacyRights(resource), ...revision(resource) }
  if (!validPublicationStatus(resource.publicationStatus)) return undefined
  return {
    publicationStatus: resource.publicationStatus,
    ...stringFields(resource, [...reviewFields, ...rightsFields]),
    ...(typeof resource.permissionAttested === 'boolean'
      ? { permissionAttested: resource.permissionAttested }
      : {}),
    ...projects(resource),
    ...revision(resource),
  }
}
