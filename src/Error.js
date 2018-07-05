import React from 'react'
import { Alert } from 'react-bootstrap'

export default function Error ({error}) {
  return error && <Alert bsStyle='danger'>{error.message}</Alert>
}
