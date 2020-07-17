import React from 'react'
import { Col, Form, Row } from 'react-bootstrap'

type Props = {
  onChange(value: string): void
  value: string | null | undefined
}

function NumberSearchForm(props: Props): JSX.Element {
  return (
    <Form>
      <Form.Group as={Row} controlId="number">
        <Col sm={{ span: 10, offset: 2 }}>
          <Form.Control
            type="text"
            name="number"
            value={props.value || ''}
            placeholder="Search museum, accession, or CDLI number"
            aria-label="Number"
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>): void =>
              props.onChange(event.target.value)
            }
          />
        </Col>
      </Form.Group>
    </Form>
  )
}

export default NumberSearchForm
