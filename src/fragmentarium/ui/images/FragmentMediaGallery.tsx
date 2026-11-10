import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import Spinner from 'common/ui/Spinner'
import ErrorAlert from 'common/errors/ErrorAlert'
import ErrorBoundary from 'common/errors/ErrorBoundary'
import { isCancellation } from 'common/utils/abortError'
import { ApiError } from 'http/ApiError'
import { Fragment } from 'fragmentarium/domain/fragment'
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

interface Scoped {
  number: string
  services: MediaGalleryServices
}
interface LoadedGallery extends Scoped {
  response: GalleryResponse
}
interface GalleryFailure extends Scoped {
  error: Error
}

/** Access was refused: previously loaded private data must not stay visible. */
function definitiveAccessFailure(error: unknown): boolean {
  return (
    error instanceof ApiError && (error.status === 401 || error.status === 403)
  )
}

async function loadGallery(
  { fragment, services }: Pick<Props, 'fragment' | 'services'>,
  signal: AbortSignal,
): Promise<GalleryResponse> {
  try {
    if (services.repository.findGallery) {
      return await services.repository.findGallery(fragment.number, signal)
    }
    return {
      media: await services.repository.findByFragment(fragment.number, signal),
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
}

/**
 * A refresh after a mutation (revision change) keeps the previous response on
 * screen so the gallery's selection and focus survive. A response is only ever
 * shown for the exact fragment and services session that requested it, and
 * responses to superseded requests are discarded.
 */
function useGallery(
  { fragment, services }: Pick<Props, 'fragment' | 'services'>,
  revision: number,
): { data: GalleryResponse | null; error: Error | null; retry: () => void } {
  const [loaded, setLoaded] = useState<LoadedGallery | null>(null)
  const [failure, setFailure] = useState<GalleryFailure | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    setFailure(null)
    loadGallery({ fragment, services }, controller.signal)
      .then((response) => {
        if (!controller.signal.aborted)
          setLoaded({ number: fragment.number, services, response })
      })
      .catch((reason) => {
        if (isCancellation(reason, controller.signal)) return
        if (definitiveAccessFailure(reason)) setLoaded(null)
        setFailure({
          number: fragment.number,
          services,
          error: reason as Error,
        })
      })
    return () => controller.abort()
    // The fragment object changes identity on unrelated refreshes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fragment.number, services, revision, retryCount])
  const inScope = (value: Scoped | null): boolean =>
    value !== null &&
    value.number === fragment.number &&
    value.services === services
  return {
    data: loaded && inScope(loaded) ? loaded.response : null,
    error: failure && inScope(failure) ? failure.error : null,
    retry: () => setRetryCount((count) => count + 1),
  }
}

function GalleryContent({
  data,
  fragment,
  services,
  fallback,
  onChanged,
}: Props & { data: GalleryResponse; onChanged: () => void }): JSX.Element {
  return (
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
              data.legacyFallbackAllowed !== false && fragment.hasLegacyPhoto
                ? fallback
                : undefined
            }
          />
        </>
      ) : data.legacyFallbackAllowed === false ? (
        <p>No images available.</p>
      ) : (
        fallback
      )}
    </>
  )
}

function GalleryData(
  props: Props & { revision: number; onChanged: () => void },
): JSX.Element {
  const { data, error, retry } = useGallery(props, props.revision)
  return (
    <ErrorBoundary>
      {!data && !error && (
        <div className="text-center my-5 withData-spinner">
          <Spinner />
        </div>
      )}
      <ErrorAlert error={error} onRetry={retry} />
      {data && <GalleryContent {...props} data={data} />}
    </ErrorBoundary>
  )
}

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
            {props.fragment.hasAnyImage ? 'Add images' : 'Add first image'}
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
