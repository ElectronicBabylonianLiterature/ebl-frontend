import React, { Component } from 'react'
import { FormGroup, FormControl, Button } from 'react-bootstrap'

class TransliteratioForm extends Component {
  state = {
    transliteration: this.props.transliteration
  }

  get rows () {
    return this.state.transliteration.split('\n').length
  }

  onChange = event => {
    this.setState({
      transliteration: event.target.value
    })
  }

  submit = event => {
    event.preventDefault()
    const path = `/fragments/${this.props.number}/transliteration`
    this.props.apiClient.postJson(path, this.state.transliteration)
  }

  render () {
    return (
      <form onSubmit={this.submit}>
        <FormGroup controlId='transliteration'>
          <FormControl
            componentClass='textarea'
            aria-label='Transliteration'
            value={this.state.transliteration}
            rows={this.rows}
            onChange={this.onChange} />
        </FormGroup>
        <Button type='submit' bsStyle='primary'>Save</Button>
      </form>
    )
  }
}

export default TransliteratioForm
