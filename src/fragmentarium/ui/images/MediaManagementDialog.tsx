import React from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import ErrorAlert from 'common/errors/ErrorAlert'
import type { MediaResource } from 'fragmentarium/domain/media'
import type { MediaMetadata } from 'fragmentarium/application/MediaManagementRepository'
import type { ManagementDialog } from './MediaManagementActions'
import MediaMetadataFields from './MediaMetadataFields'

const titles = {
  edit: 'Edit image metadata',
  remove: 'Remove image?',
  reject: 'Reject image',
}
const submitLabels = {
  edit: 'Save metadata',
  remove: 'Confirm removal',
  reject: 'Confirm rejection',
}

function DialogFields({
  dialog,
  media,
  metadata,
  setMetadata,
  manager,
  saving,
  reason,
  setReason,
}: FieldsProps): JSX.Element {
  if (dialog === 'edit')
    return (
      <MediaMetadataFields
        id="media-edit"
        value={metadata}
        onChange={setMetadata}
        disabled={saving}
        rightsEditable={manager}
        legacy={!media.publicationStatus}
      />
    )
  if (dialog === 'remove')
    return (
      <p>
        Remove “{media.caption ?? 'this image'}” from the gallery? Stored
        originals are retained for recovery.
      </p>
    )
  return (
    <Form.Group controlId="media-review-reason">
      <Form.Label>Review reason (optional)</Form.Label>
      <Form.Control
        as="textarea"
        maxLength={2000}
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        disabled={saving}
      />
    </Form.Group>
  )
}

interface FieldsProps {
  dialog: ManagementDialog | null
  media: MediaResource
  metadata: MediaMetadata
  setMetadata: (metadata: MediaMetadata) => void
  manager: boolean
  saving: boolean
  reason: string
  setReason: (reason: string) => void
}

export default function MediaManagementDialog(
  props: FieldsProps & {
    error: Error | null
    onHide: () => void
    onSubmit: () => void
  },
): JSX.Element {
  const { dialog, saving, error, onHide, onSubmit } = props
  const action = dialog ?? 'reject'
  return (
    <Modal
      className="MediaManagementModal"
      show={dialog !== null}
      onHide={onHide}
      scrollable
      aria-labelledby="media-manage-title"
      backdrop={saving ? 'static' : true}
      keyboard={!saving}
    >
      <Form
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit()
        }}
      >
        <Modal.Header closeButton={!saving}>
          <Modal.Title id="media-manage-title">{titles[action]}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ErrorAlert error={error} />
          <DialogFields {...props} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" disabled={saving} onClick={onHide}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant={dialog === 'remove' ? 'danger' : 'primary'}
            disabled={saving}
          >
            {saving ? 'Saving…' : submitLabels[action]}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
