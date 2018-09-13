import React, { Component } from 'react'
import queryString from 'query-string'
import { Form, FormGroup, ControlLabel, FormControl, Button } from 'react-bootstrap'
import { withRouter } from 'react-router-dom'

class FragmentSearchForm extends Component {
  state = {
    transliteration: this.props.transliteration || ''
  }

  onChange = event => {
    this.setState({
      transliteration: event.target.value
    })
  }

  submit = event => {
    event.preventDefault()
    this.props.history.push(`?${queryString.stringify({ transliteration: this.state.transliteration })}`)
  }

  render () {
    const rows = this.state.transliteration.split('\n').length
    return (
      <Form inline onSubmit={this.submit}>
        <FormGroup controlId='transliteration'>
          <ControlLabel>Transliteration</ControlLabel>
          {' '}
          <FormControl
            componentClass='textarea'
            value={this.state.transliteration}
            rows={Math.max(2, rows)}
            onChange={this.onChange} />
        </FormGroup>
        {' '}
        <Button type='submit' bsStyle='primary'>Search</Button>
      </Form>
    )
  }
}

export default withRouter(FragmentSearchForm)
