import React from 'react'
import { OverlayTrigger, OverlayTriggerProps } from 'react-bootstrap'

type Props = {
  className?: string
} & Omit<OverlayTriggerProps, 'children'>

function HelpTrigger({ className = '', ...props }: Props): JSX.Element {
  return (
    <OverlayTrigger placement="right" {...props}>
      <i className={`${className ?? className} fas fa-info-circle`} />
    </OverlayTrigger>
  )
}

export default HelpTrigger
