import React, { Component } from 'react'
import queryString from 'query-string'
import _ from 'lodash'
import { Form, FormControl, Button, Row, Col } from 'react-bootstrap'
import { withRouter } from 'react-router-dom'

class BibliographySearch extends Component {
  state = {
    query: this.props.query || ''
  }
  id = _.uniqueId('BibliographySearch-')

  onChange = event => {
    this.setState({
      query: event.target.value
    })
  }

  submit = event => {
    event.preventDefault()
    this.props.history.push(
      `?${queryString.stringify({ query: this.state.query })}`
    )
  }

  render() {
    return (
      <Form onSubmit={this.submit}>
        <Form.Group as={Row} controlId={this.id}>
          <Col sm={8}>
            <FormControl
              aria-label="Query"
              type="text"
              value={this.state.query}
              placeholder="Author Year Title"
              onChange={this.onChange}
            />
          </Col>
          <Col sm={4}>
            <Button type="submit" variant="primary">
              Search
            </Button>
          </Col>
        </Form.Group>
      </Form>
    )
  }
}

export default withRouter(BibliographySearch)
