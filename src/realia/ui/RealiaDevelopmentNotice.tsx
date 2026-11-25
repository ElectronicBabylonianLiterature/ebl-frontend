import React from 'react'
import { Alert } from 'react-bootstrap'

export default function RealiaDevelopmentNotice(): JSX.Element {
  return (
    <Alert variant="warning" className="realia-development-notice">
      The Dictionary of Realia is still under active development: some entries
      may be incomplete or inconsistent.
    </Alert>
  )
}
