import React, { Component } from 'react'
import { FormGroup, FormControl } from 'react-bootstrap'

class TransliteratioForm extends Component {
  render () {
    return (
      <form>
        <FormGroup controlId='transliteration'>
          <FormControl
            componentClass='textarea'
            aria-label='Transliteration'
            value={this.props.transliteration}
            rows={this.props.transliteration.split('\n').length}
            readOnly />
        </FormGroup>
      </form>
    )
  }
}

export default TransliteratioForm
