import React, { Component } from 'react'
import { Col, Form, Row } from 'react-bootstrap'

type Props = {
  onChangeNumber(value: string): void
  value: string | null | undefined
}

class NumberSearchForm extends Component<Props> {
  onChange = (event) => {
    this.props.onChangeNumber(event.target.value || '')
  }

  render() {
    return (
      <Form>
        <Form.Group as={Row} controlId="number">
          <Col sm={{ span: 10, offset: 2 }}>
            <Form.Control
              type="text"
              value={this.props.value || ''}
              placeholder="Search museum, accession, or CDLI number"
              aria-label="Number"
              onChange={this.onChange}
            />
          </Col>
        </Form.Group>
      </Form>
    )
  }
}

export default NumberSearchForm
