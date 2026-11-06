import React from 'react'
import { Alert, Button } from 'react-bootstrap'
import { isValidFindspotId } from 'fragmentarium/ui/SearchForm.state'

interface Props {
  readonly findspotId: number | string | null
  readonly onClear: () => void
}

export default function FindspotConstraint({
  findspotId,
  onClear,
}: Props): JSX.Element | null {
  const isValid = isValidFindspotId(findspotId)
  return findspotId === null ? null : (
    <Alert variant={isValid ? 'info' : 'warning'}>
      {isValid ? (
        <>Results are limited to the selected findspot (ID {findspotId}).</>
      ) : (
        <>
          Findspot ID {findspotId} is invalid. Clear the findspot filter to
          search.
        </>
      )}{' '}
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
