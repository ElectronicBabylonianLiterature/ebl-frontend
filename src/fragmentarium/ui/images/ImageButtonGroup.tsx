import React from 'react'
import './ImageButtonGroup.css'
import { Button, ButtonGroup, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { useCallback, useMemo } from 'react'

export const getImageActions = ({
  zoomIn,
  zoomOut,
  resetTransform,
  handleDownload,
  handleOpenInNewTab,
}: {
  zoomIn: () => void
  zoomOut: () => void
  resetTransform: () => void
  handleDownload: () => void
  handleOpenInNewTab: () => void
}): ImageActions => ({
  onZoomIn: () => zoomIn(),
  onZoomOut: () => zoomOut(),
  onReset: () => resetTransform(),
  onDownload: handleDownload,
  onOpenInNewTab: handleOpenInNewTab,
})

export const useImageActions = (
  image: Blob,
  fileName: string
): {
  handleDownload: () => void
  handleOpenInNewTab: () => void
  imageUrl: string
} => {
  const handleDownload = useCallback(() => {
    const link = document.createElement('a')
    link.href = URL.createObjectURL(image)
    const extension = image.type.split('/')[1]
    link.download = `eBL-${fileName}.${extension}`
    link.click()
  }, [image, fileName])

  const handleOpenInNewTab = useCallback(() => {
    const photoUrl = URL.createObjectURL(image)
    window.open(photoUrl, '_blank')
  }, [image])

  const imageUrl = useMemo(() => URL.createObjectURL(image), [image])

  return {
    handleDownload,
    handleOpenInNewTab,
    imageUrl,
  }
}

interface ButtonWithTooltipProps {
  onClick: () => void
  iconClass: string
  label: string
  tooltipId: string
}

const ButtonWithTooltip: React.FC<ButtonWithTooltipProps> = ({
  onClick,
  iconClass,
  label,
  tooltipId,
}): JSX.Element => (
  <OverlayTrigger
    placement="top"
    overlay={<Tooltip id={tooltipId}>{label}</Tooltip>}
  >
    <Button variant="light" onClick={onClick} aria-label={label}>
      <i className={iconClass} />
    </Button>
  </OverlayTrigger>
)

interface ImageActions {
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  onDownload: () => void
  onOpenInNewTab: () => void
}

const ImageButtonGroup: React.FC<{ imageActions: ImageActions }> = ({
  imageActions,
}): JSX.Element => {
  const {
    onZoomIn,
    onZoomOut,
    onReset,
    onDownload,
    onOpenInNewTab,
  } = imageActions
  return (
    <ButtonGroup className="photo-controls">
      <ButtonWithTooltip
        onClick={onZoomIn}
        iconClass="fas fa-magnifying-glass-plus"
        label="Zoom In"
        tooltipId="zoom-in-tooltip"
      />
      <ButtonWithTooltip
        onClick={onZoomOut}
        iconClass="fas fa-magnifying-glass-minus"
        label="Zoom Out"
        tooltipId="zoom-out-tooltip"
      />
      <ButtonWithTooltip
        onClick={onReset}
        iconClass="fas fa-rotate"
        label="Reset"
        tooltipId="reset-tooltip"
      />
      <ButtonWithTooltip
        onClick={onDownload}
        iconClass="fas fa-file-download"
        label="Download"
        tooltipId="download-tooltip"
      />
      <ButtonWithTooltip
        onClick={onOpenInNewTab}
        iconClass="fas fa-arrow-up-right-from-square"
        label="Open in New Tab"
        tooltipId="open-new-tab-tooltip"
      />
    </ButtonGroup>
  )
}

export default ImageButtonGroup
