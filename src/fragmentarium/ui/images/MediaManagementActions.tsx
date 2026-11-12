import React from 'react'
import { Button } from 'react-bootstrap'
import type { MediaResource } from 'fragmentarium/domain/media'
import { publicationReady } from './mediaManagementMetadata'

export type ManagementDialog = 'edit' | 'remove' | 'reject'
export default function MediaManagementActions({
  media,
  manager,
  editable,
  saving,
  open,
  publish,
  primary,
}: {
  media: MediaResource
  manager: boolean
  editable: boolean
  saving: boolean
  open: (dialog: ManagementDialog) => void
  publish: () => void
  primary: () => void
}): JSX.Element {
  const status = media.publicationStatus ?? 'PUBLISHED'
  const canPublish = !saving && publicationReady(media)
  const canReject = media.publicationStatus && status !== 'REJECTED'
  const canSetPrimary = status === 'PUBLISHED' && !media.isPrimary
  return (
    <div className="MediaManagement__actions">
      {editable && (
        <Button
          variant="outline-secondary"
          disabled={saving}
          onClick={() => open('edit')}
        >
          Edit image metadata
        </Button>
      )}
      {manager && (
        <>
          {status !== 'PUBLISHED' && (
            <Button disabled={!canPublish} onClick={publish}>
              Publish image
            </Button>
          )}
          {canReject && (
            <Button
              variant="outline-secondary"
              disabled={saving}
              onClick={() => open('reject')}
            >
              Reject image
            </Button>
          )}
          {canSetPrimary && (
            <Button
              variant="outline-secondary"
              disabled={saving}
              onClick={primary}
            >
              Set as primary
            </Button>
          )}
          <Button
            variant="outline-danger"
            disabled={saving}
            onClick={() => open('remove')}
          >
            Remove image
          </Button>
        </>
      )}
    </div>
  )
}
