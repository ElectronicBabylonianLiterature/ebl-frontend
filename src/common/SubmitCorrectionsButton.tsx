import React from 'react'
import { Button } from 'react-bootstrap'

export default function SubmitCorrectionsButton({
  id,
}: {
  id: string
}): JSX.Element {
  const email = process.env.REACT_APP_CORRECTIONS_EMAIL
  const subject = encodeURIComponent(`eBL Correction to ${id}`)
  const body = encodeURIComponent(
    `To the ${id}, I have the following correction:\n\n[comment]`
  )
  return (
    <Button
      variant="outline-primary"
      onClick={(e) => {
        window.open(`mailto:${email}?subject=${subject}&body=${body}`)
        e.preventDefault()
      }}
    >
      <i className="fas fa-envelope" />
    </Button>
  )
}
