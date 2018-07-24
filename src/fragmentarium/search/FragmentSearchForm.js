import React, { Component } from 'react'
import queryString from 'query-string'
import { Form, FormGroup, ControlLabel, FormControl, Button } from 'react-bootstrap'
import { withRouter } from 'react-router-dom'

class FragmentSearchForm extends Component {
  state = {
    number: this.props.number || ''
  }

  onChange = event => {
    this.setState({
      number: event.target.value
    })
  }

  submit = event => {
    event.preventDefault()
    this.props.history.push(`?${queryString.stringify({number: this.state.number})}`)
  }

  render () {
    return (
      <Form inline onSubmit={this.submit}>
        <FormGroup controlId='number'>
          <ControlLabel>Number</ControlLabel>
          {' '}
          <FormControl
            type='text'
            size={32}
            value={this.state.number}
            placeholder='Search museum, accession, or CDLI number.'
            onChange={this.onChange} />
        </FormGroup>
        {' '}
        <Button type='submit' bsStyle='primary'>Search</Button>
      </Form>
    )
  }
}

export default withRouter(FragmentSearchForm)
