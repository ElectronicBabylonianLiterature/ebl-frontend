import React from 'react'
import { Alert } from 'react-bootstrap'

export default function DevelopmentNotice({
  resourceName,
  className,
}: {
  resourceName: string
  className: string
}): JSX.Element {
  return (
    <Alert variant="warning" className={className}>
      The {resourceName} is still under active development and is being refined.
      Some entries may be incomplete or contain inconsistencies. Thank you for
      your patience, and please accept our apologies for any issues you may come
      across.
    </Alert>
  )
}
