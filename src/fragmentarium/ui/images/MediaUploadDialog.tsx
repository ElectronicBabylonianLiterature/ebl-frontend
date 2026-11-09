import React, { useEffect, useRef, useState } from 'react'
import { Alert, Button, Form, Modal, ProgressBar } from 'react-bootstrap'
import type { MediaGalleryServices } from 'fragmentarium/application/MediaGalleryContext'
import type { MediaMetadata } from 'fragmentarium/application/MediaManagementRepository'
import MediaMetadataFields, { emptyMediaMetadata } from './MediaMetadataFields'
import './MediaManagement.css'
import mediaUploadId from './mediaUploadId'

type UploadState =
  | 'Ready to upload'
  | 'Uploading'
  | 'Processing'
  | 'Submitted for review'
  | 'Published'
  | 'Failed'
  | 'Cancelled'
interface Entry {
  id: string
  key: string
  file: File
  metadata: MediaMetadata
  state: UploadState
  percent?: number
  error?: string
}
const maxBytes = 25 * 1024 * 1024
const completed = (entry: Entry) =>
  ['Submitted for review', 'Published'].includes(entry.state)
const busy = (entry: Entry) => ['Uploading', 'Processing'].includes(entry.state)

function Preview({ file }: { file: File }): JSX.Element {
  const [url, setUrl] = useState('')
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])
  return (
    <img
      className="MediaUpload__preview"
      src={url}
      alt={`Preview of ${file.name}`}
    />
  )
}

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
  const [entries, setEntries] = useState<Entry[]>([])
  const [shared, setShared] = useState<MediaMetadata>({ ...emptyMediaMetadata })
  const [selectionError, setSelectionError] = useState('')
  const controllers = useRef(new Map<string, AbortController>())
  const batchCancelled = useRef(false)
  const cancelledEntries = useRef(new Set<string>())
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    const active = controllers.current
    return () => {
      mounted.current = false
      active.forEach((controller) => controller.abort())
    }
  }, [])
  const update = (id: string, changes: Partial<Entry>) => {
    if (mounted.current)
      setEntries((current) =>
        current.map((entry) =>
          entry.id === id ? { ...entry, ...changes } : entry,
        ),
      )
  }
  const select = (files: FileList | File[]) => {
    const valid: Entry[] = []
    const errors: string[] = []
    Array.from(files).forEach((file) => {
      if (
        [...entries, ...valid].some(
          (entry) =>
            entry.file.name === file.name &&
            entry.file.size === file.size &&
            entry.file.lastModified === file.lastModified,
        )
      ) {
        errors.push(`${file.name}: this file is already selected.`)
        return
      }
      if (
        !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
        file.size === 0 ||
        file.size > maxBytes
      ) {
        errors.push(
          `${file.name}: select a JPEG, PNG or WebP image up to 25 MB.`,
        )
      } else {
        valid.push({
          id: mediaUploadId(),
          key: mediaUploadId(),
          file,
          metadata: { ...shared },
          state: 'Ready to upload',
        })
      }
    })
    setSelectionError(errors.join(' '))
    setEntries((current) => [...current, ...valid])
  }
  const cancel = (id: string) => {
    cancelledEntries.current.add(id)
    controllers.current.get(id)?.abort()
    update(id, { state: 'Cancelled', percent: undefined })
  }
  const upload = async (entry: Entry) => {
    if (!services.management || controllers.current.has(entry.id)) return
    const controller = new AbortController()
    controllers.current.set(entry.id, controller)
    update(entry.id, {
      state: 'Uploading',
      error: undefined,
      percent: undefined,
    })
    try {
      const saved = await services.management.upload(
        fragmentNumber,
        entry.file,
        entry.metadata,
        entry.key,
        {
          signal: controller.signal,
          onProgress: (loaded, total) => {
            if (!controller.signal.aborted)
              update(entry.id, {
                percent:
                  total && total > 0
                    ? Math.min(100, Math.round((loaded * 100) / total))
                    : undefined,
              })
          },
          onProcessing: () => {
            if (!controller.signal.aborted)
              update(entry.id, { state: 'Processing', percent: undefined })
          },
        },
      )
      if (mounted.current && !controller.signal.aborted) {
        update(entry.id, {
          state:
            saved.publicationStatus === 'PUBLISHED'
              ? 'Published'
              : 'Submitted for review',
          percent: undefined,
        })
        onChanged()
      }
    } catch (error) {
      update(entry.id, {
        state: controller.signal.aborted ? 'Cancelled' : 'Failed',
        error: controller.signal.aborted ? undefined : (error as Error).message,
        percent: undefined,
      })
    } finally {
      controllers.current.delete(entry.id)
    }
  }
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    batchCancelled.current = false
    cancelledEntries.current.clear()
    const queue = entries.filter((entry) => !completed(entry) && !busy(entry))
    const worker = async () => {
      while (queue.length && mounted.current && !batchCancelled.current) {
        const entry = queue.shift()
        if (entry && !cancelledEntries.current.has(entry.id))
          await upload(entry)
      }
    }
    await Promise.all([worker(), worker()])
  }
  const active = entries.some(busy)
  return (
    <Modal
      className="MediaManagementModal"
      show={show}
      onHide={onHide}
      size="lg"
      scrollable
      aria-labelledby="media-upload-title"
      backdrop={active ? 'static' : true}
      keyboard={!active}
    >
      <Form onSubmit={submit}>
        <Modal.Header closeButton={!active}>
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
              if (!active) select(event.dataTransfer.files)
            }}
          >
            <Form.Group controlId="media-upload-files">
              <Form.Label>Choose images or drop them here</Form.Label>
              <Form.Control
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                disabled={active}
                onChange={(event) => {
                  const input = event.target as HTMLInputElement
                  if (input.files) select(input.files)
                  input.value = ''
                }}
              />
            </Form.Group>
          </div>
          {selectionError && (
            <Alert variant="danger" role="alert">
              {selectionError}
            </Alert>
          )}
          <details className="my-2">
            <summary>Shared metadata for this batch</summary>
            <MediaMetadataFields
              id="media-shared"
              value={shared}
              onChange={setShared}
              disabled={active}
              requiredFields={false}
            />
            <Button
              type="button"
              variant="outline-secondary"
              disabled={active}
              onClick={() =>
                setEntries((current) =>
                  current.map((entry) =>
                    completed(entry)
                      ? entry
                      : {
                          ...entry,
                          metadata: {
                            ...shared,
                            caption: shared.caption || entry.metadata.caption,
                          },
                          key: mediaUploadId(),
                        },
                  ),
                )
              }
            >
              Apply to selected images
            </Button>
          </details>
          {entries.map((entry, index) => (
            <section
              className="MediaUpload__entry"
              key={entry.id}
              aria-label={`Upload ${entry.file.name}`}
            >
              <div className="MediaUpload__heading">
                <Preview file={entry.file} />
                <strong>{entry.file.name}</strong>
                {!completed(entry) && !busy(entry) && (
                  <Button
                    type="button"
                    variant="outline-danger"
                    disabled={active}
                    onClick={() =>
                      setEntries((current) =>
                        current.filter((item) => item.id !== entry.id),
                      )
                    }
                    aria-label={`Remove ${entry.file.name}`}
                  >
                    Remove
                  </Button>
                )}
              </div>
              <p role="status" aria-live="polite">
                {entry.state}
              </p>
              {entry.percent !== undefined && (
                <ProgressBar
                  now={entry.percent}
                  label={`${entry.percent}%`}
                  aria-label={`Upload progress for ${entry.file.name}`}
                />
              )}
              {entry.error && (
                <Alert variant="danger" role="alert">
                  {entry.error}
                </Alert>
              )}
              {!completed(entry) && (
                <MediaMetadataFields
                  id={`media-entry-${index}`}
                  value={entry.metadata}
                  disabled={active}
                  onChange={(metadata) =>
                    update(entry.id, {
                      metadata,
                      key: mediaUploadId(),
                      state: 'Ready to upload',
                    })
                  }
                />
              )}
              {(busy(entry) ||
                (active && entry.state === 'Ready to upload')) && (
                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={() => cancel(entry.id)}
                >
                  Cancel {entry.file.name}
                </Button>
              )}
              {['Failed', 'Cancelled'].includes(entry.state) && (
                <>
                  <Button
                    type="button"
                    variant="outline-primary"
                    disabled={active}
                    onClick={() => upload(entry)}
                  >
                    Retry {entry.file.name}
                  </Button>
                  <p>
                    Submit again to retry this image. A cancelled request may
                    have reached the server; retrying uses the same request
                    identity.
                  </p>
                </>
              )}
            </section>
          ))}
        </Modal.Body>
        <Modal.Footer>
          {active ? (
            <Button
              type="button"
              variant="outline-secondary"
              onClick={() => {
                batchCancelled.current = true
                controllers.current.forEach((_, id) => cancel(id))
                setEntries((current) =>
                  current.map((entry) =>
                    entry.state === 'Ready to upload'
                      ? { ...entry, state: 'Cancelled' }
                      : entry,
                  ),
                )
              }}
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
            disabled={active || !entries.some((entry) => !completed(entry))}
          >
            Submit images for review
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
