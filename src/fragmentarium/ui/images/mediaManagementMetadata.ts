import type { MediaResource } from 'fragmentarium/domain/media'
import type { MediaMetadata } from 'fragmentarium/application/MediaManagementRepository'
import type { MediaGalleryServices } from 'fragmentarium/application/MediaGalleryContext'

export function metadataOf(media: MediaResource): MediaMetadata {
  return {
    type: media.type,
    caption: media.caption ?? '',
    attribution: media.attribution,
    sourceInstitution: media.sourceInstitution ?? '',
    rightsStatement: media.rightsStatement ?? '',
    permissionAttested: media.permissionAttested ?? false,
    creator: media.creator,
    copyrightHolder: media.copyrightHolder,
    description: media.description,
    references: media.references,
    projects: media.projects,
  }
}

function editableField(
  key: string,
  manager: boolean,
  legacy: boolean,
): boolean {
  if (legacy && key === 'permissionAttested') return false
  return (
    manager ||
    !['rightsStatement', 'copyrightHolder', 'permissionAttested'].includes(key)
  )
}

export function changedMetadata(
  draft: MediaMetadata,
  media: MediaResource,
  manager: boolean,
): Partial<MediaMetadata> {
  const initial = metadataOf(media)
  return Object.fromEntries(
    Object.entries(draft).filter(([key, value]) => {
      if (!editableField(key, manager, !media.publicationStatus)) return false
      return JSON.stringify(value) !== JSON.stringify(initial[key])
    }),
  )
}

export function ownsSubmission(
  media: MediaResource,
  services: MediaGalleryServices,
): boolean {
  return Boolean(
    services.canUpload && media.uploaderId === services.currentUserId,
  )
}

export function canEditMedia(
  media: MediaResource,
  services: MediaGalleryServices,
): boolean {
  if (services.canManage) return true
  return (
    ownsSubmission(media, services) &&
    media.publicationStatus === 'PENDING_REVIEW'
  )
}

export function publicationReady(media: MediaResource): boolean {
  return Boolean(media.permissionAttested && media.rightsStatement)
}
