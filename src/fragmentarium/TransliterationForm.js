import React, { Component } from 'react'
import { FormGroup, FormControl, Button } from 'react-bootstrap'
import Error from 'Error'

class TransliteratioForm extends Component {
  state = {
    transliteration: this.props.transliteration,
    error: null,
    disabled: false
  }

  get rows () {
    return this.state.transliteration.split('\n').length
  }

  onChange = event => {
    this.setState({
      ...this.state,
      transliteration: event.target.value
    })
  }

  submit = event => {
    event.preventDefault()
    this.setState({
      ...this.state,
      disabled: true
    })
    const path = `/fragments/${this.props.number}/transliteration`
    this.props.apiClient.postJson(path, this.state.transliteration)
      .then(() => {
        this.setState({
          ...this.state,
          error: null,
          disabled: false
        })
        this.props.onChange()
      })
      .catch(error => this.setState({
        ...this.state,
        error: error,
        disabled: false
      }))
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
        <Button type='submit' bsStyle='primary' disabled={this.state.disabled}>
          Save
        </Button>
        <Error error={this.state.error} />
      </form>
    )
  }
}

export default TransliteratioForm
