import React, { Component } from 'react'
import { Col, Form, Row } from 'react-bootstrap'

type Props = {
  number: string | null | undefined
  handleChanges(searchForm: string, searchQuery: string): void
}

class FragmentSearchForm extends Component<Props> {
  state = {
    number: this.props.number || '',
  }

  onChange = (event) => {
    this.setState({
      number: event.target.value,
    })
    this.props.handleChanges('number', event.target.value || '')
  }

  render() {
    return (
      <Form>
        <Form.Group as={Row} controlId="number">
          <Col sm={2} />
          <Col sm={8}>
            <Form.Control
              type="text"
              value={this.state.number}
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

export default FragmentSearchForm
