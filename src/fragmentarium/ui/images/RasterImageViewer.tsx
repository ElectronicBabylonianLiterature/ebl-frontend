import React from 'react'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import ImageButtonGroup, {
  getImageActions,
  useImageActions,
} from 'fragmentarium/ui/images/ImageButtonGroup'
import 'fragmentarium/ui/images/Photo.css'

export default function RasterImageViewer({
  image,
  fileName,
  description,
  onDownload,
}: {
  image: Blob
  fileName: string
  description: string
  onDownload?: () => void
}): JSX.Element {
  const { handleDownload, handleOpenInNewTab, imageUrl } = useImageActions(
    image,
    fileName,
  )
  return (
    <TransformWrapper
      panning={{ activationKeys: [] }}
      initialScale={1}
      minScale={0.5}
      maxScale={8}
    >
      {({ zoomIn, zoomOut, resetTransform }) => (
        <div className="photo-container">
          <ImageButtonGroup
            imageActions={getImageActions({
              zoomIn,
              zoomOut,
              resetTransform,
              handleDownload: onDownload ?? handleDownload,
              handleOpenInNewTab,
            })}
          />
          <TransformComponent>
            <div className="image-wrapper">
              <img
                src={imageUrl}
                alt={description}
                onClick={(event) => event.preventDefault()}
              />
            </div>
          </TransformComponent>
        </div>
      )}
    </TransformWrapper>
  )
}
