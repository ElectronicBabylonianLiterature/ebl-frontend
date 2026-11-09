import React, { useState } from 'react'
import { Button } from 'react-bootstrap'
import withData from 'http/withData'
import ErrorAlert from 'common/errors/ErrorAlert'
import type { Fragment } from 'fragmentarium/domain/fragment'
import type { MediaResource } from 'fragmentarium/domain/media'
import { UnsupportedMediaResponseError } from 'fragmentarium/application/MediaRepository'
import type { MediaGalleryServices } from 'fragmentarium/application/MediaGalleryContext'
import MediaGallery from 'fragmentarium/ui/images/MediaGallery'
import MediaUploadDialog from './MediaUploadDialog'

interface Props {
  fragment: Fragment
  services: MediaGalleryServices
  fallback: React.ReactNode
}

interface GalleryResponse {
  media: readonly MediaResource[]
  error?: UnsupportedMediaResponseError
  legacyFallbackAllowed?: boolean
}

const GalleryData = withData<
  Props & { revision: number; onChanged: () => void },
  object,
  GalleryResponse
>(
  ({ data, fragment, services, fallback, onChanged }) => (
    <>
      <p>
        {data.media.length} catalogued{' '}
        {data.media.length === 1 ? 'image' : 'images'}
      </p>
      {data.media.length > 0 || data.error ? (
        <>
          <ErrorAlert error={data.error ?? null} />
          <MediaGallery
            fragment={fragment}
            media={data.media}
            services={services}
            onChanged={onChanged}
            legacyPhoto={
              data.legacyFallbackAllowed !== false &&
              (fragment.legacyHasPhoto ?? fragment.hasPhoto)
                ? fallback
                : undefined
            }
          />
        </>
      ) : (
        <>
          {data.legacyFallbackAllowed === false ? (
            <p>No images available.</p>
          ) : (
            fallback
          )}
        </>
      )}
    </>
  ),
  async ({ fragment, services }, signal) => {
    try {
      if (services.repository.findGallery) {
        return await services.repository.findGallery(fragment.number, signal)
      }
      return {
        media: await services.repository.findByFragment(
          fragment.number,
          signal,
        ),
      }
    } catch (error) {
      if (error instanceof UnsupportedMediaResponseError) {
        return {
          media: [],
          error,
          legacyFallbackAllowed: error.legacyFallbackAllowed,
        }
      }
      throw error
    }
  },
  {
    watch: ({ fragment, services, revision }) => [
      fragment.number,
      services,
      revision,
    ],
    retry: true,
  },
)

export default function FragmentMediaGallery(props: Props): JSX.Element {
  const [showUpload, setShowUpload] = useState(false)
  const [revision, setRevision] = useState(0)
  const onChanged = () => setRevision((value) => value + 1)
  const canUpload = props.services.canUpload && props.services.management
  return (
    <section aria-label="Photographs and copies">
      <div className="MediaManagement__actions">
        <h3>Photographs and copies</h3>
        {canUpload && (
          <Button onClick={() => setShowUpload(true)}>
            {props.fragment.hasPhoto || props.fragment.mediaSummary?.count
              ? 'Add images'
              : 'Add first image'}
          </Button>
        )}
      </div>
      <GalleryData {...props} revision={revision} onChanged={onChanged} />
      {canUpload && (
        <MediaUploadDialog
          show={showUpload}
          onHide={() => setShowUpload(false)}
          fragmentNumber={props.fragment.number}
          services={props.services}
          onChanged={onChanged}
        />
      )}
    </section>
  )
}
