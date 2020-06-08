import React, { Component } from 'react'
import { Col, Form, Row } from 'react-bootstrap'

type Props = {
  id: string | null | undefined
  pages: string | null | undefined
  handleChanges(searchForm: string, searchQuery: string): void
}

class ReferenceSearchForm extends Component<Props> {
  state = {
    id: this.props.id || '',
    pages: this.props.pages || '',
  }

  onChangeId = (event) => {
    this.setState({
      id: event.target.value,
    })
    this.props.handleChanges('id', event.target.value || '')
  }

  onChangePage = (event) => {
    this.setState({
      pages: event.target.value,
    })
    this.props.handleChanges('pages', event.target.value || '')
  }

  render() {
    return (
      <Form>
        <Form.Group as={Row} controlId="reference">
          <Col sm={{ span: 5, offset: 2 }}>
            <Form.Control
              type="text"
              value={this.state.id}
              placeholder="Search Reference"
              aria-label="FragmentId"
              onChange={this.onChangeId}
            />
          </Col>
          <Col sm={5}>
            <Form.Control
              type="text"
              value={this.state.pages}
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
