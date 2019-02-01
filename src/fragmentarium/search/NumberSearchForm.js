import React, { Component } from 'react'
import queryString from 'query-string'
import { Form, FormGroup, FormLabel, FormControl, Button, Col } from 'react-bootstrap'
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
    this.props.history.push(`/fragmentarium/search/?${queryString.stringify({ number: this.state.number })}`)
  }

  render () {
    return (
      <Form horizontal onSubmit={this.submit}>
        <FormGroup controlId='number'>
          <Col as={FormLabel} sm={2} />
          <Col sm={7}>
            <FormControl
              type='text'
              value={this.state.number}
              placeholder='Search museum, accession, or CDLI number'
              aria-label='Number'
              onChange={this.onChange} />
          </Col>
          <Col sm={1}>
            <Button type='submit' variant='primary'>Search</Button>
          </Col>
          <Col sm={3} />
        </FormGroup>
      </Form>
    )
  }
}

export default withRouter(FragmentSearchForm)
