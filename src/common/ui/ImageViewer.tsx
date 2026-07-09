import React, { useCallback, useState } from 'react'
import { Button, ButtonGroup, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import useObjectUrl from 'common/hooks/useObjectUrl'
import './ImageViewer.css'

type ImageViewerProps = {
  readonly image: Blob
  readonly alt: string
  readonly downloadFileName: string
  readonly loading?: 'lazy' | 'eager'
  readonly decoding?: 'async' | 'auto' | 'sync'
}

type ViewerButtonProps = {
  readonly label: string
  readonly iconClass: string
  readonly tooltipId: string
  readonly onClick: () => void
}

const ZOOM_STEP = 0.5
const ZOOM_ANIMATION_TIME = 180
const MIN_SCALE = 0.5
const MAX_SCALE = 8

function extensionFromMimeType(mimeType: string): string {
  return mimeType.split('/')[1] || 'bin'
}

function ViewerButton({
  label,
  iconClass,
  tooltipId,
  onClick,
}: ViewerButtonProps): JSX.Element {
  return (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip id={tooltipId}>{label}</Tooltip>}
    >
      <Button
        type="button"
        variant="light"
        className="ImageViewer__control"
        onClick={onClick}
        aria-label={label}
      >
        <i className={iconClass} aria-hidden="true" />
      </Button>
    </OverlayTrigger>
  )
}

export default function ImageViewer({
  image,
  alt,
  downloadFileName,
  loading = 'eager',
  decoding = 'async',
}: ImageViewerProps): JSX.Element {
  const imageUrl = useObjectUrl(image)
  const [scale, setScale] = useState(1)

  const handleDownload = useCallback(() => {
    if (!imageUrl) {
      return
    }

    const link = document.createElement('a')
    link.download = `eBL-${downloadFileName}.${extensionFromMimeType(image.type)}`
    link.href = imageUrl
    link.click()
  }, [downloadFileName, image.type, imageUrl])

  const handleOpenInNewTab = useCallback(() => {
    const originalUrl = URL.createObjectURL(image)
    const openedWindow = window.open(
      originalUrl,
      '_blank',
      'noopener,noreferrer',
    )

    if (openedWindow) {
      openedWindow.opener = null
    }

    setTimeout(() => URL.revokeObjectURL(originalUrl), 60000)
  }, [image])

  if (!imageUrl) {
    return (
      <div className="ImageViewer ImageViewer--empty" role="status">
        Image unavailable
      </div>
    )
  }

  return (
    <div className="ImageViewer">
      <TransformWrapper
        initialScale={1}
        minScale={MIN_SCALE}
        maxScale={MAX_SCALE}
        centerOnInit
        centerZoomedOut
        smooth
        wheel={{ step: 0.16, smoothStep: 0.004 }}
        panning={{ activationKeys: [], allowLeftClickPan: true }}
        pinch={{ step: 5 }}
        doubleClick={{ mode: 'toggle', step: 1.2, animationTime: 180 }}
        zoomAnimation={{ animationTime: 180, animationType: 'easeOut' }}
        alignmentAnimation={{ animationTime: 180, animationType: 'easeOut' }}
        velocityAnimation={{ animationTime: 180, animationType: 'easeOut' }}
        onTransformed={(_, state) => setScale(state.scale)}
        onInit={({ state }) => setScale(state.scale)}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div
              className="ImageViewer__toolbar"
              role="toolbar"
              aria-label="Image controls"
            >
              <ButtonGroup>
                <ViewerButton
                  onClick={() =>
                    zoomIn(ZOOM_STEP, ZOOM_ANIMATION_TIME, 'easeOut')
                  }
                  iconClass="fas fa-magnifying-glass-plus"
                  label="Zoom in"
                  tooltipId="image-viewer-zoom-in-tooltip"
                />
                <ViewerButton
                  onClick={() =>
                    zoomOut(ZOOM_STEP, ZOOM_ANIMATION_TIME, 'easeOut')
                  }
                  iconClass="fas fa-magnifying-glass-minus"
                  label="Zoom out"
                  tooltipId="image-viewer-zoom-out-tooltip"
                />
                <ViewerButton
                  onClick={() => resetTransform(ZOOM_ANIMATION_TIME, 'easeOut')}
                  iconClass="fas fa-rotate"
                  label="Reset image"
                  tooltipId="image-viewer-reset-tooltip"
                />
                <ViewerButton
                  onClick={handleDownload}
                  iconClass="fas fa-file-download"
                  label="Download image"
                  tooltipId="image-viewer-download-tooltip"
                />
                <ViewerButton
                  onClick={handleOpenInNewTab}
                  iconClass="fas fa-arrow-up-right-from-square"
                  label="Open original image"
                  tooltipId="image-viewer-open-original-tooltip"
                />
              </ButtonGroup>
              <output className="ImageViewer__scale" aria-label="Zoom level">
                {Math.round(scale * 100)}%
              </output>
            </div>

            <TransformComponent
              wrapperClass="ImageViewer__viewport"
              contentClass="ImageViewer__content"
            >
              <img
                className="ImageViewer__image"
                src={imageUrl}
                alt={alt}
                loading={loading}
                decoding={decoding}
                draggable={false}
                onClick={(event) => event.preventDefault()}
              />
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  )
}
