import React, { useState } from 'react'
import ErrorAlert from 'common/errors/ErrorAlert'
import type { MediaResource } from 'fragmentarium/domain/media'
import type { MediaGalleryServices } from 'fragmentarium/application/MediaGalleryContext'
import type { MediaMetadata } from 'fragmentarium/application/MediaManagementRepository'
import MediaManagementActions, {
  type ManagementDialog,
} from './MediaManagementActions'
import MediaManagementDialog from './MediaManagementDialog'
import {
  canEditMedia,
  changedMetadata,
  metadataOf,
  ownsSubmission,
} from './mediaManagementMetadata'
import { useMediaOperation } from './mediaManagementOperation'

function PublicationStatus({ media }: { media: MediaResource }): JSX.Element {
  const labels = {
    PENDING_REVIEW: 'Pending review',
    REJECTED: 'Rejected',
    PUBLISHED: 'Published',
  }
  return (
    <>
      <p role="status">
        {labels[media.publicationStatus ?? 'PUBLISHED']}
        {media.isPrimary ? ' · Primary image' : ''}
      </p>
      {media.reviewReason && <p>Review note: {media.reviewReason}</p>}
    </>
  )
}

export default function MediaManagementControls({
  media,
  fragmentNumber,
  services,
  onChanged,
}: {
  media: MediaResource
  fragmentNumber: string
  services: MediaGalleryServices
  onChanged: () => void
}): JSX.Element | null {
  const [dialog, setDialog] = useState<ManagementDialog | null>(null)
  const [dialogMedia, setDialogMedia] = useState(media)
  const [reason, setReason] = useState('')
  const [metadata, setMetadata] = useState<MediaMetadata>(() =>
    metadataOf(media),
  )
  const operation = useMediaOperation(
    () => {
      setDialog(null)
      onChanged()
    },
    onChanged,
    () => {
      // The draft or decision was based on an outdated item: drop it and show
      // the stale-revision message beside the refreshed item instead.
      setDialog(null)
      onChanged()
    },
  )
  const manager = Boolean(services.canManage)
  const authorized = manager || ownsSubmission(media, services)
  if (!services.management || !authorized) return null
  const management = services.management
  // The revision of the item as displayed; never refetched before a mutation.
  const revision = media.revision
  const open = (next: ManagementDialog): void => {
    // A gallery refresh may arrive while the dialog is open. Keep its draft
    // and decision tied to the item the user actually reviewed.
    setDialogMedia(media)
    if (next === 'edit') setMetadata(metadataOf(media))
    if (next === 'reject') setReason('')
    operation.clearError()
    setDialog(next)
  }
  const close = (): void => {
    if (!operation.saving) setDialog(null)
  }
  const submit = (): void => {
    if (dialog === 'remove')
      operation.run((signal) =>
        management.remove(
          fragmentNumber,
          dialogMedia.id,
          signal,
          dialogMedia.revision,
        ),
      )
    else if (dialog === 'reject')
      operation.run((signal) =>
        management.reject(
          fragmentNumber,
          dialogMedia.id,
          reason,
          signal,
          dialogMedia.revision,
        ),
      )
    else
      operation.run((signal) =>
        management.update(
          fragmentNumber,
          dialogMedia.id,
          changedMetadata(metadata, dialogMedia, manager),
          signal,
          dialogMedia.revision,
        ),
      )
  }
  return (
    <section aria-label="Manage selected image">
      <PublicationStatus media={media} />
      <ErrorAlert error={dialog ? null : operation.error} />
      <MediaManagementActions
        media={media}
        manager={manager}
        editable={canEditMedia(media, services)}
        saving={operation.saving}
        open={open}
        publish={() =>
          operation.run((signal) =>
            management.publish(
              fragmentNumber,
              media.id,
              undefined,
              signal,
              revision,
            ),
          )
        }
        primary={() =>
          operation.run((signal) =>
            management.setPrimary(fragmentNumber, media.id, signal, revision),
          )
        }
      />
      <MediaManagementDialog
        dialog={dialog}
        media={dialogMedia}
        metadata={metadata}
        setMetadata={setMetadata}
        manager={manager}
        saving={operation.saving}
        reason={reason}
        setReason={setReason}
        error={operation.error}
        onHide={close}
        onSubmit={submit}
      />
    </section>
  )
}
