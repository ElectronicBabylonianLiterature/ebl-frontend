import React, { useEffect, useRef, useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import ErrorAlert from 'common/errors/ErrorAlert'
import type { MediaResource } from 'fragmentarium/domain/media'
import type { MediaGalleryServices } from 'fragmentarium/application/MediaGalleryContext'
import type { MediaMetadata } from 'fragmentarium/application/MediaManagementRepository'
import MediaMetadataFields from './MediaMetadataFields'

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
  const [dialog, setDialog] = useState<'edit' | 'remove' | 'reject' | null>(
    null,
  )
  const [reason, setReason] = useState('')
  const [error, setError] = useState<Error | null>(null)
  const [saving, setSaving] = useState(false)
  const initialMetadata: MediaMetadata = {
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
  const [metadata, setMetadata] = useState<MediaMetadata>(initialMetadata)
  const controller = useRef(new AbortController())
  useEffect(() => {
    const current = new AbortController()
    controller.current = current
    return () => current.abort()
  }, [])
  const manager = Boolean(services.canManage)
  const ownPending =
    services.canUpload &&
    media.uploaderId === services.currentUserId &&
    media.publicationStatus === 'PENDING_REVIEW'
  const ownSubmission =
    services.canUpload && media.uploaderId === services.currentUserId
  if (!services.management || (!manager && !ownSubmission)) return null
  const management = services.management
  const run = async (operation: (signal: AbortSignal) => Promise<unknown>) => {
    if (saving) return
    setSaving(true)
    setError(null)
    try {
      await operation(controller.current.signal)
      if (!controller.current.signal.aborted) {
        setDialog(null)
        onChanged()
      }
    } catch (error) {
      if (!controller.current.signal.aborted) setError(error as Error)
    } finally {
      if (!controller.current.signal.aborted) setSaving(false)
    }
  }
  const status = media.publicationStatus ?? 'PUBLISHED'
  return (
    <section aria-label="Manage selected image">
      <p role="status">
        {status === 'PENDING_REVIEW'
          ? 'Pending review'
          : status === 'REJECTED'
            ? 'Rejected'
            : 'Published'}
        {media.isPrimary ? ' · Primary image' : ''}
      </p>
      {media.reviewReason && <p>Review note: {media.reviewReason}</p>}
      <ErrorAlert error={dialog ? null : error} />
      <div className="MediaManagement__actions">
        {(manager || ownPending) && (
          <Button
            variant="outline-secondary"
            disabled={saving}
            onClick={() => {
              setError(null)
              setDialog('edit')
            }}
          >
            Edit image metadata
          </Button>
        )}
        {manager && (
          <>
            {status !== 'PUBLISHED' && (
              <Button
                disabled={
                  saving || !media.permissionAttested || !media.rightsStatement
                }
                onClick={() =>
                  run((signal) =>
                    management.publish(
                      fragmentNumber,
                      media.id,
                      undefined,
                      signal,
                    ),
                  )
                }
              >
                Publish image
              </Button>
            )}
            {media.publicationStatus && status !== 'REJECTED' && (
              <Button
                variant="outline-secondary"
                disabled={saving}
                onClick={() => setDialog('reject')}
              >
                Reject image
              </Button>
            )}
            {status === 'PUBLISHED' && !media.isPrimary && (
              <Button
                variant="outline-secondary"
                disabled={saving}
                onClick={() =>
                  run((signal) =>
                    management.setPrimary(fragmentNumber, media.id, signal),
                  )
                }
              >
                Set as primary
              </Button>
            )}
            <Button
              variant="outline-danger"
              disabled={saving}
              onClick={() => setDialog('remove')}
            >
              Remove image
            </Button>
          </>
        )}
      </div>
      <Modal
        className="MediaManagementModal"
        show={dialog !== null}
        onHide={() => {
          if (!saving) setDialog(null)
        }}
        scrollable
        aria-labelledby="media-manage-title"
        backdrop={saving ? 'static' : true}
        keyboard={!saving}
      >
        <Form
          onSubmit={(event) => {
            event.preventDefault()
            if (dialog === 'remove')
              run((signal) =>
                management.remove(fragmentNumber, media.id, signal),
              )
            else if (dialog === 'reject')
              run((signal) =>
                management.reject(fragmentNumber, media.id, reason, signal),
              )
            else {
              const editable = Object.fromEntries(
                Object.entries(metadata).filter(
                  ([key, value]) =>
                    JSON.stringify(value) !==
                      JSON.stringify(initialMetadata[key]) &&
                    (manager ||
                      ![
                        'rightsStatement',
                        'copyrightHolder',
                        'permissionAttested',
                      ].includes(key)) &&
                    (media.publicationStatus || key !== 'permissionAttested'),
                ),
              )
              run((signal) =>
                management.update(fragmentNumber, media.id, editable, signal),
              )
            }
          }}
        >
          <Modal.Header closeButton={!saving}>
            <Modal.Title id="media-manage-title">
              {dialog === 'edit'
                ? 'Edit image metadata'
                : dialog === 'remove'
                  ? 'Remove image?'
                  : 'Reject image'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ErrorAlert error={error} />
            {dialog === 'edit' ? (
              <MediaMetadataFields
                id="media-edit"
                value={metadata}
                onChange={setMetadata}
                disabled={saving}
                rightsEditable={manager}
                legacy={!media.publicationStatus}
              />
            ) : dialog === 'remove' ? (
              <p>
                Remove “{media.caption ?? 'this image'}” from the gallery?
                Stored originals are retained for recovery.
              </p>
            ) : (
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
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              disabled={saving}
              onClick={() => setDialog(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={dialog === 'remove' ? 'danger' : 'primary'}
              disabled={saving}
            >
              {saving
                ? 'Saving…'
                : dialog === 'edit'
                  ? 'Save metadata'
                  : dialog === 'remove'
                    ? 'Confirm removal'
                    : 'Confirm rejection'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </section>
  )
}
