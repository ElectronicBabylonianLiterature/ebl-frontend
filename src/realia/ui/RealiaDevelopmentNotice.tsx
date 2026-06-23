import React from 'react'
import { Alert } from 'react-bootstrap'

export default function RealiaDevelopmentNotice(): JSX.Element {
  return (
    <Alert variant="warning" className="realia-development-notice">
      The Dictionary of Realia is still under active development and is being
      refined. Some entries may be incomplete or contain inconsistencies. Thank
      you for your patience, and please accept our apologies for any issues you
      may come across.
    </Alert>
  )
}
