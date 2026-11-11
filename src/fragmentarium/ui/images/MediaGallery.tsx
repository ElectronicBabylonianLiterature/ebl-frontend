import React, { useState } from 'react'
import { Button } from 'react-bootstrap'
import type { Fragment } from 'fragmentarium/domain/fragment'
import type { MediaResource } from 'fragmentarium/domain/media'
import type { MediaGalleryServices } from 'fragmentarium/application/MediaGalleryContext'
import {
  selectInitialMedia,
  selectMediaById,
  sortMedia,
} from 'fragmentarium/domain/mediaGallery'
import MediaViewer from 'fragmentarium/ui/images/MediaViewer'
import MediaThumbnail from 'fragmentarium/ui/images/MediaThumbnail'
import 'fragmentarium/ui/images/MediaGallery.css'

const pageSize = 12

export default function MediaGallery({
  fragment,
  media,
  services,
  legacyPhoto,
}: {
  fragment: Fragment
  media: readonly MediaResource[]
  services: MediaGalleryServices
  legacyPhoto?: React.ReactNode
}): JSX.Element {
  const orderedMedia = sortMedia(media)
  const initial = selectInitialMedia(orderedMedia)
  const [selectedId, setSelectedId] = useState(initial?.id ?? '')
  const selected =
    selectedId === 'legacy'
      ? undefined
      : (selectMediaById(orderedMedia, selectedId) ?? initial)
  const [page, setPage] = useState(() =>
    Math.floor(
      Math.max(
        0,
        orderedMedia.findIndex((item) => item.id === initial?.id),
      ) / pageSize,
    ),
  )
  const lastPage = Math.max(0, Math.ceil(orderedMedia.length / pageSize) - 1)
  const activePage = Math.min(page, lastPage)
  return (
    <section aria-label={`Images of ${fragment.number}`}>
      <div
        className="MediaGallery__thumbnails"
        role="group"
        aria-label="Choose an image"
      >
        {legacyPhoto && (
          <Button
            variant={selectedId === 'legacy' ? 'primary' : 'outline-secondary'}
            aria-pressed={selectedId === 'legacy'}
            onClick={() => setSelectedId('legacy')}
          >
            Legacy photo
          </Button>
        )}
        {orderedMedia
          .slice(activePage * pageSize, (activePage + 1) * pageSize)
          .map((item, index) => (
            <Button
              key={item.id}
              variant={
                selected?.id === item.id ? 'primary' : 'outline-secondary'
              }
              aria-pressed={selected?.id === item.id}
              onClick={() => setSelectedId(item.id)}
            >
              <MediaThumbnail
                fragmentNumber={fragment.number}
                media={item}
                binaryLoader={services.binaryLoader}
              />
              <span>
                {item.caption ??
                  `${item.type === 'PHOTO' ? 'Photo' : 'Copy'} ${activePage * pageSize + index + 1}`}
              </span>
            </Button>
          ))}
      </div>
      {lastPage > 0 && (
        <nav aria-label="Image pages" className="MediaGallery__pagination">
          <Button
            disabled={activePage === 0}
            onClick={() => setPage(activePage - 1)}
          >
            Previous images
          </Button>
          <span>
            Page {activePage + 1} of {lastPage + 1}
          </span>
          <Button
            disabled={activePage === lastPage}
            onClick={() => setPage(activePage + 1)}
          >
            Next images
          </Button>
        </nav>
      )}
      {selectedId === 'legacy' && legacyPhoto}
      {selected && (
        <MediaViewer
          key={selected.id}
          fragment={fragment}
          media={selected}
          binaryLoader={services.binaryLoader}
        />
      )}
    </section>
  )
}
