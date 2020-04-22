import React, { Component } from 'react'
import { stringify } from 'query-string'
import { Form, Button, Row, Col } from 'react-bootstrap'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { History } from 'history'

type Props = {
  number: string | null | undefined
  history: History
} & RouteComponentProps

class FragmentSearchForm extends Component<Props> {
  state = {
    number: this.props.number || '',
  }

  onChange = (event) => {
    this.setState({
      number: event.target.value,
    })
  }

  submit = (event) => {
    event.preventDefault()
    this.props.history.push(
      `/fragmentarium/search/?${stringify({
        number: this.state.number,
      })}`
    )
  }

  render() {
    return (
      <Form onSubmit={this.submit}>
        <Form.Group as={Row} controlId="number">
          <Col sm={2} />
          <Col sm={7}>
            <Form.Control
              type="text"
              value={this.state.number}
              placeholder="Search museum, accession, or CDLI number"
              aria-label="Number"
              onChange={this.onChange}
            />
          </Col>
          <Col sm={3}>
            <Button type="submit" variant="primary">
              Search
            </Button>
          </Col>
        </Form.Group>
      </Form>
    )
  }
}

export default withRouter(FragmentSearchForm)
