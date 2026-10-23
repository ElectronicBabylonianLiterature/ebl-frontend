import React, { useContext, useEffect, useState } from 'react'
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
}): JSX.Element {
  const [image, setImage] = useState<Blob | null>(null)
  useEffect(() => {
    const controller = new AbortController()
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
      .catch(() => undefined)
    return (): void => controller.abort()
  }, [fragmentNumber, mediaId, size, services])
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
    />
  ) : (
    <>{fallback}</>
  )
}
