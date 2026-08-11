import React from 'react'
import { Alert } from 'react-bootstrap'

export default function ErrorAlert({
  error,
}: {
  error: Error | null
}): JSX.Element | null {
  return error && <Alert variant="danger">{error.message}</Alert>
}
