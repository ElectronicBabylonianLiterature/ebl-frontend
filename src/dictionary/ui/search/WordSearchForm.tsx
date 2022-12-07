import React, { Component } from 'react'
import { stringify } from 'query-string'
import { Form, FormControl, Button, Row, Col } from 'react-bootstrap'
import { withRouter, RouteComponentProps } from 'react-router-dom'

type Props = {
  query: string[] | string | null | undefined
  history
  location
  match
} & RouteComponentProps
type State = {
  query: { word: string; meaning: string; root: string; vowelClass: string }
}

class WordSearch extends Component<Props, State> {
  state = {
    query: { word: '', meaning: '', root: '', vowelClass: '' },
  }

  onChange = (event) => {
    const { id, value } = event.target
    this.setState({
      query: { ...this.state.query, [id]: value },
    })
    console.log(this.state.query)
  }

  submit = (event) => {
    event.preventDefault()
    this.props.history.push(`?${stringify(this.state.query)}`)
  }

  render() {
    return (
      <Form onSubmit={this.submit}>
        <Form.Group as={Row} controlId="word">
          <Form.Label column sm={3}>
            Word
          </Form.Label>
          <Col sm={6}>
            <FormControl
              type="text"
              value={this.state.query.word}
              placeholder="word"
              onChange={this.onChange}
            />
          </Col>
          <Col sm={2}>
            <Button type="submit" variant="primary">
              Query
            </Button>
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="meaning">
          <Form.Label column sm={3}>
            Meaning
          </Form.Label>
          <Col sm={6}>
            <FormControl
              type="text"
              value={this.state.query.meaning}
              placeholder="meaning"
              onChange={this.onChange}
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="root">
          <Form.Label column sm={3}>
            Root
          </Form.Label>
          <Col sm={6}>
            <FormControl
              type="text"
              value={this.state.query.root}
              placeholder="root"
              onChange={this.onChange}
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="vowelClass">
          <Form.Label column sm={3}>
            Vowel class
          </Form.Label>
          <Col sm={6}>
            <FormControl
              type="text"
              value={this.state.query.vowelClass}
              placeholder="vowel class (verbs)"
              onChange={this.onChange}
            />
          </Col>
        </Form.Group>
      </Form>
    )
  }
}

export default withRouter(WordSearch)
