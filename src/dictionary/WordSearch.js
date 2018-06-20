import React, { Component } from 'react'
import { Form, FormGroup, ControlLabel, FormControl, Button } from 'react-bootstrap'
import _ from 'lodash'

class WordSearch extends Component {
  constructor (props) {
    super(props)

    this.state = {
      form: {
        lemma: ''
      }
    }
  }

  onChange = (key, event) => {
    this.setState({
      form: Object.assign(this.state.form, { [key]: event.target.value })
    })
  }

  submit = event => {
    event.preventDefault()
    this.props.httpClient
      .fetchJson(`${process.env.REACT_APP_DICTIONARY_API_URL}/words/search/${this.state.form.lemma}`)
      .then(this.props.onResponse)
      .catch(_.partial(this.props.onResponse, null))
  }

  render () {
    return (
      <Form inline onSubmit={this.submit}>
        <FormGroup controlId='lemma'>
          <ControlLabel>Lemma</ControlLabel>
          <FormControl
            type='text'
            value={this.state.form.lemma}
            placeholder='lemma'
            onChange={_.partial(this.onChange, 'lemma')} />
        </FormGroup>
        <Button type='submit' bsStyle='primary'>Query</Button>
      </Form>
    )
  }
}

export default WordSearch
