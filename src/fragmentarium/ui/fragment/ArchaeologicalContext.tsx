import _ from 'lodash'
import React from 'react'
import { Form, Col } from 'react-bootstrap'

function ArchaeologicalContext({ archaeology }: { archaeology? }): JSX.Element {
  return (
    <Form>
      <Form.Row>
        <Form.Group as={Col} controlId={_.uniqueId('Archaeology-')}>
          <Form.Label>Excavation number</Form.Label>
          <Form.Control
            plaintext
            readOnly
            value={archaeology?.excavationNumber || 'N/A'}
          />
        </Form.Group>
      </Form.Row>
    </Form>
  )
}

export default ArchaeologicalContext
