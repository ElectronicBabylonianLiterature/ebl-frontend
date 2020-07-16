import React, { Component } from 'react'
import { Col, Form, Row } from 'react-bootstrap'

type Props = {
  onChange(value: any): void
  value: string | null | undefined
}

class NumberSearchForm extends Component<Props> {
  render() {
    return (
      <Form>
        <Form.Group as={Row} controlId="number">
          <Col sm={{ span: 10, offset: 2 }}>
            <Form.Control
              type="text"
              name="number"
              value={this.props.value || ''}
              placeholder="Search museum, accession, or CDLI number"
              aria-label="Number"
              onChange={this.props.onChange}
            />
          </Col>
        </Form.Group>
      </Form>
    )
  }
}

export default NumberSearchForm
