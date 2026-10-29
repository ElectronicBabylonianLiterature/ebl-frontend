import React from 'react'
import withData from 'http/withData'
import ErrorAlert from 'common/errors/ErrorAlert'
import type { Fragment } from 'fragmentarium/domain/fragment'
import type { MediaResource } from 'fragmentarium/domain/media'
import { UnsupportedMediaResponseError } from 'fragmentarium/application/MediaRepository'
import type { MediaGalleryServices } from 'fragmentarium/application/MediaGalleryContext'
import MediaGallery from 'fragmentarium/ui/images/MediaGallery'

interface Props {
  fragment: Fragment
  services: MediaGalleryServices
  fallback: React.ReactNode
}

interface GalleryResponse {
  media: readonly MediaResource[]
  error?: UnsupportedMediaResponseError
}

export default withData<Props, object, GalleryResponse>(
  ({ data, fragment, services, fallback }) =>
    data.media.length > 0 || data.error ? (
      <>
        <ErrorAlert error={data.error ?? null} />
        <MediaGallery
          fragment={fragment}
          media={data.media}
          services={services}
          legacyPhoto={
            (fragment.legacyHasPhoto ?? fragment.hasPhoto)
              ? fallback
              : undefined
          }
        />
      </>
    ) : (
      <>{fallback}</>
    ),
  async ({ fragment, services }, signal) => {
    try {
      return {
        media: await services.repository.findByFragment(
          fragment.number,
          signal,
        ),
      }
    } catch (error) {
      if (error instanceof UnsupportedMediaResponseError) {
        return { media: [], error }
      }
      throw error
    }
  },
  {
    watch: ({ fragment, services }) => [fragment.number, services],
    retry: true,
  },
)
