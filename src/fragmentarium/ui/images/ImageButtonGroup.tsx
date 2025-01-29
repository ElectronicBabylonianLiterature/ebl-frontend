import React from 'react'
import './ImageButtonGroup.css'
import { Button, ButtonGroup, OverlayTrigger, Tooltip } from 'react-bootstrap'

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
}) => (
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
}) => {
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
