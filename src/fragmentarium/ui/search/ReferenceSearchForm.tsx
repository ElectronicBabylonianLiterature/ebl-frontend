import React, { Component } from 'react'
import { Col, Form, Row } from 'react-bootstrap'

type Props = {
  handleChanges(searchForm: string, searchQuery: string): void
  getUserInput(key: string): string
}

class ReferenceSearchForm extends Component<Props> {
  onChangeId = (event) => {
    this.props.handleChanges('id', event.target.value || '')
  }

  onChangePage = (event) => {
    this.props.handleChanges('pages', event.target.value || '')
  }

  render() {
    return (
      <Form>
        <Form.Group as={Row} controlId="reference">
          <Col sm={{ span: 5, offset: 2 }}>
            <Form.Control
              type="text"
              value={this.props.getUserInput('id')}
              placeholder="Search Reference"
              aria-label="FragmentId"
              onChange={this.onChangeId}
            />
          </Col>
          <Col sm={5}>
            <Form.Control
              type="text"
              value={this.props.getUserInput('pages')}
              placeholder="Search Reference Pages"
              aria-label="FragmentPage"
              onChange={this.onChangePage}
            />
          </Col>
        </Form.Group>
      </Form>
    )
  }
}

export default ReferenceSearchForm
