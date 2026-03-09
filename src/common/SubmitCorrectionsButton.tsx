import React from 'react'
import { Button, Tooltip, OverlayTrigger } from 'react-bootstrap'

export default function SubmitCorrectionsButton({
  id,
}: {
  id: string
}): JSX.Element {
  const email = process.env.REACT_APP_CORRECTIONS_EMAIL
  const subject = encodeURIComponent(`eBL Correction to ${id}`)
  const body = encodeURIComponent(
    `To the ${id} (${window.location.href}), I have the following correction:\n\n[comment]`,
  )
  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Send us your corrections to this text
    </Tooltip>
  )
  return (
    <OverlayTrigger
      placement="left"
      delay={{ show: 250, hide: 400 }}
      overlay={renderTooltip}
    >
      <Button
        variant="outline-primary"
        onClick={(e) => {
          window.open(`mailto:${email}?subject=${subject}&body=${body}`)
          e.preventDefault()
        }}
      >
        <i className="fas fa-envelope" />
      </Button>
    </OverlayTrigger>
  )
}
