import React, { useState } from 'react'
import withData from 'http/withData'
import { ApiError } from 'http/ApiClient'
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
  error?: Error
}

function isServerError(error: ApiError): boolean {
  const status = error.status ?? 0
  return status >= 500 && status < 600
}

const GalleryContents = withData<
  Props & { onRetry: () => void },
  object,
  GalleryResponse
>(
  ({ data, fragment, services, fallback, onRetry }) =>
    data.media.length > 0 || data.error ? (
      <>
        <ErrorAlert error={data.error ?? null} onRetry={onRetry} />
        <MediaGallery
          fragment={fragment}
          media={data.media}
          services={services}
          legacyPhoto={fragment.hasLegacyPhoto ? fallback : undefined}
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
      if (
        error instanceof UnsupportedMediaResponseError ||
        (error instanceof ApiError && isServerError(error))
      ) {
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

export default function FragmentMediaGallery(props: Props): JSX.Element {
  const [attempt, setAttempt] = useState(0)
  return (
    <GalleryContents
      key={attempt}
      {...props}
      onRetry={() => setAttempt((current) => current + 1)}
    />
  )
}
