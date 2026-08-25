import React from 'react'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import { ImageRendererProps } from 'fragmentarium/ui/images/viewer/imageViewerContract'
import 'fragmentarium/ui/images/Photo.css'

export const minimumScale = 0.5
export const maximumScale = 8

export default function StaticImageViewer({
  imageUrl,
  alt,
  renderToolbar,
}: ImageRendererProps): JSX.Element {
  return (
    <TransformWrapper
      panning={{ activationKeys: [] }}
      initialScale={1}
      minScale={minimumScale}
      maxScale={maximumScale}
    >
      {({ zoomIn, zoomOut, resetTransform }) => (
        <div className="photo-container">
          {renderToolbar({
            zoomIn: () => zoomIn(),
            zoomOut: () => zoomOut(),
            reset: () => resetTransform(),
          })}
          <TransformComponent>
            <div className="image-wrapper">
              <img
                src={imageUrl}
                alt={alt}
                onClick={(event) => event.preventDefault()}
              />
            </div>
          </TransformComponent>
        </div>
      )}
    </TransformWrapper>
  )
}
