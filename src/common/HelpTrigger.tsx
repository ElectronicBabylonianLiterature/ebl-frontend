import React from 'react'
import { OverlayTrigger, OverlayTriggerProps } from 'react-bootstrap'

function HelpTrigger(
  props: Omit<OverlayTriggerProps, 'children'>
): JSX.Element {
  return (
    <OverlayTrigger placement="right" {...props}>
      <i className="fas fa-info-circle" />
    </OverlayTrigger>
  )
}

export default HelpTrigger
