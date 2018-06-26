import React, { Component } from 'react'
import queryString from 'query-string'
import { Form, FormGroup, ControlLabel, FormControl, Button } from 'react-bootstrap'
import { withRouter } from 'react-router-dom'

class WordSearch extends Component {
  state = {
    lemma: this.props.lemma || ''
  }

  onChange = event => {
    this.setState({
      lemma: event.target.value
    })
  }

  submit = event => {
    event.preventDefault()
    this.props.history.push(`?${queryString.stringify({lemma: this.state.lemma})}`)
  }

  render () {
    return (
      <Form inline onSubmit={this.submit}>
        <FormGroup controlId='lemma'>
          <ControlLabel>Lemma</ControlLabel>
          {' '}
          <FormControl
            type='text'
            value={this.state.lemma}
            placeholder='lemma'
            onChange={this.onChange} />
        </FormGroup>
        {' '}
        <Button type='submit' bsStyle='primary'>Query</Button>
      </Form>
    )
  }
}

export default withRouter(WordSearch)
