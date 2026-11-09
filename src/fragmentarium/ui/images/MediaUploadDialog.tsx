import React, { useState } from 'react'
import { Alert, Button, Form, Modal } from 'react-bootstrap'
import type { MediaGalleryServices } from 'fragmentarium/application/MediaGalleryContext'
import type { MediaMetadata } from 'fragmentarium/application/MediaManagementRepository'
import MediaMetadataFields, { emptyMediaMetadata } from './MediaMetadataFields'
import MediaUploadEntry from './MediaUploadEntry'
import { useMediaUploadQueue } from './MediaUploadQueue'
import { completed } from './mediaUploadEntries'
import './MediaManagement.css'

export default function MediaUploadDialog({
  show,
  onHide,
  fragmentNumber,
  services,
  onChanged,
}: {
  show: boolean
  onHide: () => void
  fragmentNumber: string
  services: MediaGalleryServices
  onChanged: () => void
}): JSX.Element {
  const [shared, setShared] = useState<MediaMetadata>({ ...emptyMediaMetadata })
  const queue = useMediaUploadQueue(fragmentNumber, services, onChanged)
  const select = (files: FileList | File[]): void => queue.select(files, shared)
  return (
    <Modal
      className="MediaManagementModal"
      show={show}
      onHide={onHide}
      size="lg"
      scrollable
      aria-labelledby="media-upload-title"
      backdrop={queue.active ? 'static' : true}
      keyboard={!queue.active}
    >
      <Form
        onSubmit={(event) => {
          event.preventDefault()
          queue.submit()
        }}
      >
        <Modal.Header closeButton={!queue.active}>
          <Modal.Title id="media-upload-title">Add images</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Fragment <strong>{fragmentNumber}</strong>. JPEG, PNG or WebP, up to
            25 MB per image. Originals are preserved. Submissions await a
            manager’s review.
          </p>
          <div
            className="MediaUpload__drop"
            role="group"
            aria-label="Image file selection"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault()
              if (!queue.active) select(event.dataTransfer.files)
            }}
          >
            <Form.Group controlId="media-upload-files">
              <Form.Label>Choose images or drop them here</Form.Label>
              <Form.Control
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                disabled={queue.active}
                onChange={(event) => {
                  const input = event.target as HTMLInputElement
                  if (input.files) select(input.files)
                  input.value = ''
                }}
              />
            </Form.Group>
          </div>
          {queue.selectionError && (
            <Alert variant="danger" role="alert">
              {queue.selectionError}
            </Alert>
          )}
          <details className="my-2">
            <summary>Shared metadata for this batch</summary>
            <MediaMetadataFields
              id="media-shared"
              value={shared}
              onChange={setShared}
              disabled={queue.active}
              requiredFields={false}
            />
            <Button
              type="button"
              variant="outline-secondary"
              disabled={queue.active}
              onClick={() => queue.applyShared(shared)}
            >
              Apply to selected images
            </Button>
          </details>
          {queue.entries.map((entry, index) => (
            <MediaUploadEntry
              key={entry.id}
              entry={entry}
              index={index}
              active={queue.active}
              onRemove={() => queue.remove(entry.id)}
              onEdit={(metadata) => queue.edit(entry.id, metadata)}
              onCancel={() => queue.cancel(entry.id)}
              onRetry={() => queue.upload(entry)}
            />
          ))}
        </Modal.Body>
        <Modal.Footer>
          {queue.active ? (
            <Button
              type="button"
              variant="outline-secondary"
              onClick={queue.cancelAll}
            >
              Cancel uploads
            </Button>
          ) : (
            <Button type="button" variant="secondary" onClick={onHide}>
              Close
            </Button>
          )}
          <Button
            type="submit"
            disabled={
              queue.active || !queue.entries.some((entry) => !completed(entry))
            }
          >
            Submit images for review
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
