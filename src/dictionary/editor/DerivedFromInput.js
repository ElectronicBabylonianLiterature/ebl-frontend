import React from 'react'
import { Button, Card } from 'react-bootstrap'

import FormInput from './FormInput'

function DerivedFromInput ({ id, value, onChange }) {
  return (
    <Card border='light'>
      <Card.Header>Derived from</Card.Header>
      <Card.Body>
        {value ? (
          <>
            <FormInput id={id} value={value} onChange={onChange} />
            <Button onClick={() => onChange(null)} size='sm' variant='outline-secondary'>Delete derived from</Button>
          </>
        ) : (
          <Button onClick={() => onChange({ lemma: [], homonym: '', notes: [] })} size='sm' variant='outline-secondary'>Add derived from</Button>
        )}
      </Card.Body>
    </Card>
  )
}

export default DerivedFromInput
