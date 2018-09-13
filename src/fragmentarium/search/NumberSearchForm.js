import React, { Component } from 'react'
import queryString from 'query-string'
import { Form, FormGroup, ControlLabel, FormControl, Button, Col } from 'react-bootstrap'
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
    this.props.history.push(`?${queryString.stringify({ number: this.state.number })}`)
  }

  render () {
    return (
      <Form horizontal onSubmit={this.submit}>
        <FormGroup controlId='number'>
          <Col sm={2} />
          <Col componentClass={ControlLabel} sm={2}>
            Number
          </Col>
          <Col sm={4}>
            <FormControl
              type='text'
              value={this.state.number}
              placeholder='Search museum, accession, or CDLI number.'
              onChange={this.onChange} />
          </Col>
          <Col sm={1}>
            <Button type='submit' bsStyle='primary'>Search</Button>
          </Col>
          <Col sm={3} />
        </FormGroup>
      </Form>
    )
  }
}

export default withRouter(FragmentSearchForm)
