import React, { useEffect, useState } from 'react'
import { Alert, Button, ProgressBar } from 'react-bootstrap'
import MediaMetadataFields from './MediaMetadataFields'
import { busy, completed, type UploadEntry } from './mediaUploadEntries'
import type { MediaMetadata } from 'fragmentarium/application/MediaManagementRepository'

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
function EntryStatus({ entry }: { entry: UploadEntry }): JSX.Element {
  return (
    <>
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
    </>
  )
}
export default function MediaUploadEntry({
  entry,
  index,
  active,
  onRemove,
  onEdit,
  onCancel,
  onRetry,
}: {
  entry: UploadEntry
  index: number
  active: boolean
  onRemove: () => void
  onEdit: (metadata: MediaMetadata) => void
  onCancel: () => void
  onRetry: () => void
}): JSX.Element {
  const removable = !completed(entry) && !busy(entry)
  const queued = active && entry.state === 'Ready to upload'
  return (
    <section
      className="MediaUpload__entry"
      aria-label={`Upload ${entry.file.name}`}
    >
      <div className="MediaUpload__heading">
        <Preview file={entry.file} />
        <strong>{entry.file.name}</strong>
        {removable && (
          <Button
            type="button"
            variant="outline-danger"
            disabled={active}
            onClick={onRemove}
            aria-label={`Remove ${entry.file.name}`}
          >
            Remove
          </Button>
        )}
      </div>
      <EntryStatus entry={entry} />
      {!completed(entry) && (
        <MediaMetadataFields
          id={`media-entry-${index}`}
          value={entry.metadata}
          disabled={active}
          onChange={onEdit}
        />
      )}
      {(busy(entry) || queued) && (
        <Button type="button" variant="outline-secondary" onClick={onCancel}>
          Cancel {entry.file.name}
        </Button>
      )}
      {['Failed', 'Cancelled'].includes(entry.state) && (
        <>
          <Button
            type="button"
            variant="outline-primary"
            disabled={active}
            onClick={onRetry}
          >
            Retry {entry.file.name}
          </Button>
          <p>
            Submit again to retry this image. A cancelled request may have
            reached the server; retrying uses the same request identity.
          </p>
        </>
      )}
    </section>
  )
}
