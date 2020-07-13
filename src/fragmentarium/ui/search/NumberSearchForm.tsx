import React, { Component } from 'react'
import { Col, Form, Row } from 'react-bootstrap'

type Props = {
  onChange(searchForm: string, searchQuery: string): void
  value: string
}

class NumberSearchForm extends Component<Props> {
  onChange = (event) => {
    this.props.onChange('number', event.target.value || '')
  }

  render() {
    return (
      <Form>
        <Form.Group as={Row} controlId="number">
          <Col sm={{ span: 10, offset: 2 }}>
            <Form.Control
              type="text"
              value={this.props.value}
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
