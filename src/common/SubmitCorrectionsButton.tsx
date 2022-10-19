import React from 'react'
import { Button } from 'react-bootstrap'

export default function SubmitCorrectionsButton({
  id,
}: {
  id: string
}): JSX.Element {
  const email = 'zsombor.foldi@lmu.de'
  const subject = `eBL Correction to ${id}`
  const body = `To the text ${id}, I have the following correction:\n\n[comment]`
  return (
    <Button variant="outline-primary">
      <a
        href={encodeURIComponent(
          `mailto:${email}?subject=${subject}&body=${body}`
        )}
        target="_blank"
        rel="noreferrer"
      >
        <i className="fas fa-envelope" />
      </a>
    </Button>
  )
}
