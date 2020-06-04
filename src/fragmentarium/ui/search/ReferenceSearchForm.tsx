import React, { Component } from 'react'
import { Col, Form } from 'react-bootstrap'

type Props = {
  id: string | null | undefined
  page: string | null | undefined
  handleChanges(searchForm: string, searchQuery: string): void
}

class ReferenceSearchForm extends Component<Props> {
  state = {
    id: this.props.id || '',
    pages: this.props.page || '',
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
        <Form.Row>
          <Col sm={2} />
          <Col>
            <Form.Control
              type="text"
              value={this.state.id}
              placeholder="Search ID"
              aria-label="FragmentId"
              onChange={this.onChangeId}
            />
          </Col>
          <Col>
            <Form.Control
              type="text"
              value={this.state.pages}
              placeholder="Search Pages/Number"
              aria-label="FragmentPage"
              onChange={this.onChangePage}
            />
          </Col>
          <Col sm={2} />
        </Form.Row>
        <Col sm={2} />
      </Form>
    )
  }
}

export default ReferenceSearchForm
