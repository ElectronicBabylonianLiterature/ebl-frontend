import React, { useContext, useEffect, useState } from 'react'
import { ApiError } from 'http/ApiClient'
import {
  MediaGalleryContext,
  MediaGalleryServices,
} from 'fragmentarium/application/MediaGalleryContext'
import { Fragment } from 'fragmentarium/domain/fragment'
import {
  ThumbnailSizes,
  ThumbnailSize,
  isRasterMediaMimeType,
} from 'fragmentarium/domain/media'
import { fragmentMediaThumbnailUrl } from 'fragmentarium/infrastructure/mediaUrls'
import SummaryThumbnail from 'fragmentarium/ui/search/SummaryThumbnail'

function LoadedThumbnail({
  fragmentNumber,
  mediaId,
  size,
  services,
  linked,
}: {
  fragmentNumber: string
  mediaId: string
  size: ThumbnailSize
  services: MediaGalleryServices
  linked: boolean
  fallback: React.ReactNode
}): JSX.Element {
  const [image, setImage] = useState<Blob | null>(null)
  const [missing, setMissing] = useState(false)
  useEffect(() => {
    const controller = new AbortController()
    setImage(null)
    setMissing(false)
    services.binaryLoader
      .fetch(
        { fragmentNumber, mediaId, representation: size },
        controller.signal,
      )
      .then((blob) => {
        if (!controller.signal.aborted && isRasterMediaMimeType(blob.type)) {
          setImage(blob)
        }
      })
      .catch((error: Error) => {
        if (
          !controller.signal.aborted &&
          error instanceof ApiError &&
          error.status === 404
        ) {
          setMissing(true)
        }
      })
    return (): void => controller.abort()
  }, [fragmentNumber, mediaId, size, services])
  if (missing) {
    return <>{fallback}</>
  }
  return (
    <SummaryThumbnail
      fragmentNumber={fragmentNumber}
      thumbnailPath={null}
      image={image}
      linked={linked}
    />
  )
}

export default function MediaSummaryThumbnail({
  fragment,
  fallback,
  linked = true,
}: {
  fragment: Fragment
  fallback: React.ReactNode
  linked?: boolean
}): JSX.Element {
  const services = useContext(MediaGalleryContext)
  const primary = fragment.mediaSummary?.primary
  const size =
    primary &&
    ThumbnailSizes.find(
      (candidate) =>
        fragmentMediaThumbnailUrl(fragment.number, primary.id, candidate) ===
        primary.thumbnail?.url,
    )
  return services && primary && size ? (
    <LoadedThumbnail
      key={`${services.sessionKey}:${fragment.number}:${primary.id}:${size}`}
      fragmentNumber={fragment.number}
      mediaId={primary.id}
      size={size}
      services={services}
      linked={linked}
      fallback={fallback}
    />
  ) : (
    <>{fallback}</>
  )
}
