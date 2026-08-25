import React, { ReactNode, useCallback } from 'react'
import ImageButtonGroup, {
  getImageActions,
  useImageActions,
} from 'fragmentarium/ui/images/ImageButtonGroup'
import StaticImageViewer from 'fragmentarium/ui/images/viewer/StaticImageViewer'
import {
  ImageRenderer,
  ViewerZoomControls,
} from 'fragmentarium/ui/images/viewer/imageViewerContract'

interface Props {
  readonly image: Blob
  readonly fileName: string
  readonly alt: string
  readonly renderer?: ImageRenderer
  readonly footer?: ReactNode
}

export default function ImageViewer({
  image,
  fileName,
  alt,
  renderer = StaticImageViewer,
  footer,
}: Props): JSX.Element {
  const { handleDownload, handleOpenInNewTab, imageUrl } = useImageActions(
    image,
    fileName,
  )

  const renderToolbar = useCallback(
    (controls: ViewerZoomControls): ReactNode => (
      <ImageButtonGroup
        imageActions={getImageActions({
          zoomIn: controls.zoomIn,
          zoomOut: controls.zoomOut,
          resetTransform: controls.reset,
          handleDownload,
          handleOpenInNewTab,
        })}
      />
    ),
    [handleDownload, handleOpenInNewTab],
  )

  return (
    <article>
      {renderer({ imageUrl, alt, renderToolbar })}
      {footer}
    </article>
  )
}
