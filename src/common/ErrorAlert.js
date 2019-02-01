import React from 'react'
import { Alert } from 'react-bootstrap'

export default function ErrorAlert ({ error }) {
  return error && <Alert variant='danger'>{error.message}</Alert>
}
