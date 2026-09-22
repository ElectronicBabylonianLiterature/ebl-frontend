import React from 'react'
import { Alert, Button } from 'react-bootstrap'

interface Props {
  readonly findspotId: number | string | null
  readonly onClear: () => void
}

export default function FindspotConstraint({
  findspotId,
  onClear,
}: Props): JSX.Element | null {
  return findspotId === null ? null : (
    <Alert variant="info">
      Results are limited to findspot {findspotId}.{' '}
      <Button
        type="button"
        size="sm"
        variant="outline-secondary"
        onClick={onClear}
      >
        Clear findspot filter
      </Button>
    </Alert>
  )
}
