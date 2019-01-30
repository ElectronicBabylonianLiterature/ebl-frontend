import React, { Component } from 'react'
import queryString from 'query-string'
import { Form, FormGroup, ControlLabel, FormControl, Button, Col, Popover } from 'react-bootstrap'
import { withRouter } from 'react-router-dom'
import HelpTrigger from 'common/HelpTrigger'

function SearchHelp () {
  return (
    <Popover id='TransliterationSearchHelp' title='Search transliterations'>
      <ul>
        <li>
          Sequences of signs are retrieved regardless of the values entered: e.g., <code>me lik</code> will retrieve <code>šip taš</code>, <code>me ur</code>, etc.
        </li>
        <li>
          Signs in consecutive lines can be searched by entering them in consecutive lines of the search field.
        </li>
        <li>
          Unicode should be used throughout, including in the subindex numbers (<code>ša₂</code> and <code>ṣu₂</code>).
        </li>
      </ul>
    </Popover>
  )
}

class TransliterationSearchForm extends Component {
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
          <Col sm={2} componentClass={ControlLabel} >
          Transliteration
            {' '}
            <HelpTrigger overlay={SearchHelp()} />
          </Col>
          <Col sm={4}>
            <FormControl
              componentClass='textarea'
              value={this.state.transliteration}
              rows={Math.max(2, rows)}
              placeholder='Search transliterations'
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

export default withRouter(TransliterationSearchForm)
