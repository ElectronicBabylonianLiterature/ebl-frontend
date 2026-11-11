import useExifArtist from 'fragmentarium/ui/images/useExifArtist'
import React from 'react'
import withData from 'http/withData'
import type MediaBinaryLoader from 'fragmentarium/application/MediaBinaryLoader'
import type { MediaBinaryRepresentation } from 'fragmentarium/application/MediaBinaryLoader'
import RasterImageViewer from 'fragmentarium/ui/images/RasterImageViewer'
import { isRasterMediaMimeType } from 'fragmentarium/domain/media'

interface PreviewProps {
  fragmentNumber: string
  mediaId: string
  representation: MediaBinaryRepresentation
  binaryLoader: MediaBinaryLoader
  description: string
  onDownload: () => void
  attribution?: string
}

function LoadedPreview({
  data,
  fragmentNumber,
  description,
  onDownload,
  attribution,
  representation,
}: PreviewProps & { data: Blob }): JSX.Element {
  const artist = useExifArtist(
    representation === 'original' && !attribution ? data : undefined,
  )
  return (
    <>
      <RasterImageViewer
        image={data}
        fileName={fragmentNumber}
        description={description}
        onDownload={onDownload}
      />
      {artist && <p>Photograph by {artist}</p>}
    </>
  )
}

export default withData<PreviewProps, object, Blob>(
  LoadedPreview,
  async ({ binaryLoader, fragmentNumber, mediaId, representation }, signal) => {
    const blob = await binaryLoader.fetch(
      { fragmentNumber, mediaId, representation },
      signal,
    )
    if (!isRasterMediaMimeType(blob.type)) {
      throw new Error('This image cannot be displayed safely.')
    }
    return blob
  },
  {
    watch: ({ fragmentNumber, mediaId, representation, binaryLoader }) => [
      fragmentNumber,
      mediaId,
      representation,
      binaryLoader,
    ],
    retry: true,
  },
)
