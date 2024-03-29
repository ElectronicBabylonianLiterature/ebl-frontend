import React, { Component } from 'react'
import { stringify } from 'query-string'
import _ from 'lodash'
import { Form, FormControl, Button, Row, Col } from 'react-bootstrap'
import { withRouter, RouteComponentProps } from 'react-router-dom'

type Props = { query: string | null | undefined } & RouteComponentProps

class BibliographySearch extends Component<Props, { query: string }> {
  state = {
    query: this.props.query || '',
  }
  id = _.uniqueId('BibliographySearch-')

  onChange = (event) => {
    this.setState({
      query: event.target.value,
    })
  }

  submit = (event) => {
    event.preventDefault()
    this.props.history.push(`?${stringify({ query: this.state.query })}`)
  }

  render() {
    return (
      <Form onSubmit={this.submit}>
        <Form.Group as={Row} controlId={this.id}>
          <Col sm={8}>
            <FormControl
              aria-label="Bibliography-Query"
              type="text"
              value={this.state.query}
              placeholder="Author Year Title / Container-Title-Short Collection-Number"
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
