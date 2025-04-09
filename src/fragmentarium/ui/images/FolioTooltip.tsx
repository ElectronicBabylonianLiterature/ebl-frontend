import React, { useState } from 'react'
import { Overlay, Tooltip, TooltipProps } from 'react-bootstrap'
import './FolioTooltip.css'

interface FolioTooltipProps {
  folioInitials: string
  folioName: string
}

export default function FolioTooltip({
  folioInitials,
  folioName,
}: FolioTooltipProps): JSX.Element {
  const [show, setShow] = useState(false)
  const [target, setTarget] = useState<HTMLElement | null>(null)

  const handleMouseEnterTrigger = (e: React.MouseEvent<HTMLElement>) => {
    setShow(true)
    setTarget(e.currentTarget)
  }

  const handleMouseLeaveTrigger = () => {
    setTimeout(() => {
      if (!document.querySelector('.folio-tooltip:hover')) {
        setShow(false)
      }
    }, 100) // Small delay to allow transition to tooltip
  }

  const handleMouseEnterTooltip = () => {
    setShow(true)
  }

  const handleMouseLeaveTooltip = () => {
    setShow(false)
  }

  const renderTooltip = (props: Partial<TooltipProps>) => (
    <Tooltip
      id={`folio-tooltip-${folioInitials}`}
      {...props}
      className="folio-tooltip"
      onMouseEnter={handleMouseEnterTooltip}
      onMouseLeave={handleMouseLeaveTooltip}
    >
      Read more about {folioName}’s folios{' '}
      <a
        href={`/about/library#${folioInitials}`}
        target="_blank"
        rel="noopener noreferrer"
        className="folio-tooltip-link"
        onClick={(e) => e.stopPropagation()}
        aria-label="External link"
      >
        <i
          className="fas fa-external-link-square-alt"
          data-testid="external-link-icon"
        />
      </a>
    </Tooltip>
  )

  return (
    <>
      <span
        className="folio-tooltip-trigger"
        data-testid="tooltip-trigger"
        onMouseEnter={handleMouseEnterTrigger}
        onMouseLeave={handleMouseLeaveTrigger}
      >
        <i className="fas fa-info-circle fa-1x" data-testid="info-icon" />
      </span>
      <Overlay target={target} show={show} placement="top">
        {renderTooltip}
      </Overlay>
    </>
  )
}
