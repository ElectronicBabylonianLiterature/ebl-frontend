import React, { Component } from 'react'
import queryString from 'query-string'
import { Form, FormGroup, FormLabel, FormControl, Button } from 'react-bootstrap'
import { withRouter } from 'react-router-dom'

class WordSearch extends Component {
  state = {
    query: this.props.query || ''
  }

  onChange = event => {
    this.setState({
      query: event.target.value
    })
  }

  submit = event => {
    event.preventDefault()
    this.props.history.push(`?${queryString.stringify({ query: this.state.query })}`)
  }

  render () {
    return (
      <Form inline onSubmit={this.submit}>
        <FormGroup controlId='query'>
          <FormLabel>Query</FormLabel>
          {' '}
          <FormControl
            type='text'
            value={this.state.query}
            placeholder='lemma or meaning'
            onChange={this.onChange} />
        </FormGroup>
        {' '}
        <Button type='submit' variant='primary'>Query</Button>
      </Form>
    )
  }
}

export default withRouter(WordSearch)
