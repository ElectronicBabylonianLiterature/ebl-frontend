import React from 'react'
import { Alert, Button } from 'react-bootstrap'
import 'corpus/ui/edit-lite/edit-lite.sass'

interface Props {
  readonly error: string | null
  readonly onRetry: (() => void) | null
}

export default function LoadFailure({ error, onRetry }: Props): JSX.Element {
  return (
    <Alert className="edit-lite-line__alert" variant="danger">
      {error}{' '}
      {onRetry !== null && (
        <Button size="sm" variant="outline-danger" onClick={onRetry}>
          Retry
        </Button>
      )}
    </Alert>
  )
}
