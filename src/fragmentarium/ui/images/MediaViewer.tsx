import React from 'react'
import { Button } from 'react-bootstrap'
import ReactMarkdown from 'react-markdown'
import ErrorAlert from 'common/errors/ErrorAlert'
import type { Fragment } from 'fragmentarium/domain/fragment'
import {
  isRasterMediaMimeType,
  MediaResource,
} from 'fragmentarium/domain/media'
import type MediaBinaryLoader from 'fragmentarium/application/MediaBinaryLoader'
import MediaPreview from 'fragmentarium/ui/images/MediaPreview'
import useMediaDownload from 'fragmentarium/ui/images/useMediaDownload'

export default function MediaViewer({
  fragment,
  media,
  binaryLoader,
}: {
  fragment: Fragment
  media: MediaResource
  binaryLoader: MediaBinaryLoader
}): JSX.Element {
  const { download, downloading, error } = useMediaDownload(
    fragment.number,
    media,
    binaryLoader,
  )
  const representation = media.representations.display
    ? 'display'
    : isRasterMediaMimeType(media.representations.original.mimeType)
      ? 'original'
      : null
  return (
    <article aria-label={media.caption ?? `${media.type} ${fragment.number}`}>
      {representation ? (
        <MediaPreview
          fragmentNumber={fragment.number}
          mediaId={media.id}
          representation={representation}
          binaryLoader={binaryLoader}
          description={media.caption ?? `Fragment ${fragment.number}`}
          onDownload={download}
          attribution={media.attribution}
        />
      ) : (
        <p>
          No preview available.{' '}
          <Button onClick={download} disabled={downloading}>
            Download original
          </Button>
        </p>
      )}
      {downloading && <p role="status">Downloading original…</p>}
      <ErrorAlert error={error} />
      <footer className="Photo__copyright">
        {media.caption && <p>{media.caption}</p>}
        {media.attribution && <p>{media.attribution}</p>}
        <small>
          <ReactMarkdown>{fragment.museum.copyright ?? ''}</ReactMarkdown>
        </small>
      </footer>
    </article>
  )
}
