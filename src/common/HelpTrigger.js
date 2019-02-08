import React from 'react'
import { OverlayTrigger } from 'react-bootstrap'

function HelpTrigger (props) {
  return (
    <OverlayTrigger {...props}>
      <i className='fas fa-info-circle' />
    </OverlayTrigger>
  )
}

export default HelpTrigger
