import React, { Component } from 'react'
import queryString from 'query-string'
import { Form, FormGroup, ControlLabel, FormControl, Button, Col } from 'react-bootstrap'
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
      <Form horizontal onSubmit={this.submit}>
        <FormGroup controlId='transliteration'>
          <Col sm={2} />
          <Col componentClass={ControlLabel} sm={2}>
            Transliteration
          </Col>
          <Col sm={4}>
            <FormControl
              componentClass='textarea'
              value={this.state.transliteration}
              rows={Math.max(2, rows)}
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
