import React, { Component } from 'react'
import { FormGroup, FormControl } from 'react-bootstrap'

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

  render () {
    return (
      <form>
        <FormGroup controlId='transliteration'>
          <FormControl
            componentClass='textarea'
            aria-label='Transliteration'
            value={this.state.transliteration}
            rows={this.rows}
            onChange={this.onChange} />
        </FormGroup>
      </form>
    )
  }
}

export default TransliteratioForm
