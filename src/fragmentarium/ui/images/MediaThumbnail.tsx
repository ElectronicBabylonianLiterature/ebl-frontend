import React, { useEffect, useState } from 'react'
import useObjectUrl from 'common/hooks/useObjectUrl'
import type MediaBinaryLoader from 'fragmentarium/application/MediaBinaryLoader'
import {
  isRasterMediaMimeType,
  MediaResource,
  ThumbnailSize,
} from 'fragmentarium/domain/media'

export default function MediaThumbnail({
  fragmentNumber,
  media,
  binaryLoader,
}: {
  fragmentNumber: string
  media: MediaResource
  binaryLoader: MediaBinaryLoader
}): JSX.Element | null {
  const [image, setImage] = useState<Blob | null>(null)
  const imageUrl = useObjectUrl(image)
  const size = (['small', 'medium', 'large'] as const).find(
    (candidate: ThumbnailSize) => media.representations.thumbnails[candidate],
  )
  useEffect(() => {
    const controller = new AbortController()
    setImage(null)
    if (size) {
      binaryLoader
        .fetch(
          { fragmentNumber, mediaId: media.id, representation: size },
          controller.signal,
        )
        .then((blob) => {
          if (!controller.signal.aborted && isRasterMediaMimeType(blob.type)) {
            setImage(blob)
          }
        })
        .catch(() => undefined)
    }
    return (): void => controller.abort()
  }, [fragmentNumber, media.id, binaryLoader, size])
  return imageUrl ? <img src={imageUrl} alt="" /> : null
}
