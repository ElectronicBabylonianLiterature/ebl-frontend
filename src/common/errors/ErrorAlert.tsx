import React from 'react'
import { Alert, Button } from 'react-bootstrap'

export default function ErrorAlert({
  error,
  onRetry,
}: {
  error: Error | null
  onRetry?: () => void
}): JSX.Element | null {
  return (
    error && (
      <Alert variant="danger">
        {error.message}
        {onRetry && (
          <div>
            <Button variant="danger" onClick={onRetry}>
              Retry
            </Button>
          </div>
        )}
      </Alert>
    )
  )
}
