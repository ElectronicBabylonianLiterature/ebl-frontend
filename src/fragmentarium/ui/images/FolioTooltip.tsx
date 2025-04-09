import React from 'react'
import { OverlayTrigger, Tooltip, TooltipProps } from 'react-bootstrap'
import './FolioTooltip.css'

interface FolioTooltipProps {
  folioInitials: string
  folioName: string
}

export default function FolioTooltip({
  folioInitials,
  folioName,
}: FolioTooltipProps): JSX.Element {
  const renderTooltip = (props: Partial<TooltipProps>) => (
    <Tooltip id={`folio-tooltip-${folioInitials}`} {...props}>
      Read more about {folioName}’s folios{' '}
      <a
        href={`/about/library#${folioInitials}`}
        target="_blank"
        rel="noopener noreferrer"
        className="folio-tooltip-link"
        onClick={(e) => e.stopPropagation()}
        aria-label="External link"
      >
        <i className="fas fa-external-link-square-alt" />
      </a>
    </Tooltip>
  )

  return (
    <OverlayTrigger
      placement="top"
      trigger={['hover', 'focus']}
      delay={{ show: 150, hide: 700 }}
      overlay={renderTooltip}
    >
      <span className="folio-tooltip-trigger" data-testid="tooltip-trigger">
        <i className="fas fa-info-circle fa-1x" />
      </span>
    </OverlayTrigger>
  )
}
