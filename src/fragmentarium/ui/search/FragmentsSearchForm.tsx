import React, { Component } from 'react'
import { Form, Button, Row, Col } from 'react-bootstrap'
import { withRouter, RouteComponentProps } from 'react-router-dom'

type Props = {
  id: string | null | undefined
  page: string | null | undefined
  handleChanges(searchForm: string, searchQuery: string): void
} & RouteComponentProps

class FragmentsSearchForm extends Component<Props> {
  state = {
    id: this.props.id || '',
    page: this.props.page || '',
  }

  onChangeId = (event) => {
    this.setState({
      id: event.target.value,
    })
    this.props.handleChanges('id', event.target.value || '')
  }

  onChangePage = (event) => {
    this.setState({
      page: event.target.value,
    })
    this.props.handleChanges('page', event.target.value || '')
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
              value={this.state.page}
              placeholder="Search Page/Number"
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

export default withRouter(FragmentsSearchForm)
