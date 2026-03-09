import React from 'react'
import { Button, Card } from 'react-bootstrap'

import FormInput from './FormInput'
import { Derived } from 'dictionary/domain/Word'

function DerivedFromInput({
  value,
  onChange,
}: {
  value: Derived | null
  onChange: (value: Derived | null) => void
}): JSX.Element {
  return (
    <Card border="light">
      <Card.Header>Derived from</Card.Header>
      <Card.Body>
        {value ? (
          <>
            <FormInput value={value} onChange={onChange} />
            <Button
              onClick={() => onChange(null)}
              size="sm"
              variant="outline-secondary"
            >
              Delete derived from
            </Button>
          </>
        ) : (
          <Button
            onClick={() => onChange({ lemma: [], homonym: '', notes: [] })}
            size="sm"
            variant="outline-secondary"
          >
            Add derived from
          </Button>
        )}
      </Card.Body>
    </Card>
  )
}

export default DerivedFromInput
