import React, { Component } from 'react'
import queryString from 'query-string'
import { Form, Button, Row, Col, Popover } from 'react-bootstrap'
import { withRouter } from 'react-router-dom'
import _ from 'lodash'
import HelpTrigger from 'common/HelpTrigger'

function TransliterationSearchHelp() {
  return (
    <Popover
      id={_.uniqueId('TransliterationSearchHelp-')}
      title="Search transliterations"
    >
      <Popover.Content>
        <ul>
          <li>
            Sequences of signs are retrieved regardless of the values entered:
            e.g., <code>me lik</code> will retrieve <code>šip taš</code>,{' '}
            <code>me ur</code>, etc.
          </li>
          <li>
            Signs in consecutive lines can be searched by entering them in
            consecutive lines of the search field.
          </li>
          <li>
            Text with diacritics (e.g. <code>ša₂</code>, <code>á</code>) or
            without them (e.g. <code>sza2</code> or <code>ca2</code>,{' '}
            <code>s,a3</code>, <code>t,a4</code>) can be entered.
          </li>
        </ul>
      </Popover.Content>
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
    this.props.history.push(
      `/fragmentarium/search/?${queryString.stringify({
        transliteration: this.state.transliteration
      })}`
    )
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.transliteration !== prevProps.transliteration) {
      this.setState({
        transliteration: this.props.transliteration || ''
      })
    }
  }

  render() {
    const rows = this.state.transliteration.split('\n').length
    return (
      <Form onSubmit={this.submit}>
        <Form.Group as={Row} controlId="transliteration">
          <Col
            sm={2}
            as={Form.Label}
            className="TransliterationSearchForm__label"
          >
            <HelpTrigger overlay={TransliterationSearchHelp()} />
          </Col>
          <Col sm={7}>
            <Form.Control
              as="textarea"
              value={this.state.transliteration}
              rows={Math.max(2, rows)}
              placeholder="Search transliterations"
              aria-label="Transliteration"
              onChange={this.onChange}
            />
          </Col>
          <Col sm={3}>
            <Button type="submit" variant="primary">
              Search
            </Button>
          </Col>
        </Form.Group>
      </Form>
    )
  }
}

export default withRouter(TransliterationSearchForm)
