import React, { Component } from 'react'
import { stringify } from 'query-string'
import { Form, FormControl, Button, Row, Col } from 'react-bootstrap'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import _ from 'lodash'

type Props = {
  query: string[] | string | null | undefined
  history
  location
  match
} & RouteComponentProps
type State = { query: string }

class WordSearch extends Component<Props, State> {
  state = {
    query: _.isArray(this.props.query)
      ? this.props.query.join(' ')
      : this.props.query || '',
  }

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
        <Form.Group as={Row} controlId="query">
          <Form.Label column sm={2}>
            Query
          </Form.Label>
          <Col sm={6}>
            <FormControl
              type="text"
              value={this.state.query}
              placeholder="lemma or meaning"
              onChange={this.onChange}
            />
          </Col>
          <Col sm={4}>
            <Button type="submit" variant="primary">
              Query
            </Button>
          </Col>
        </Form.Group>
      </Form>
    )
  }
}

export default withRouter(WordSearch)
