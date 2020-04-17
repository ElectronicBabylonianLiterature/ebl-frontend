import React, { Component } from 'react'
import { FormGroup } from 'react-bootstrap'
import _ from 'lodash'

import LemmaInput from './LemmaInput'
import ListInput from './TextListInput'
import TextInput from './TextInput'

class FormInput extends Component<{ value; onChange }> {
  lemmaChanged = (lemma) => {
    this.props.onChange({
      ...this.props.value,
      ...lemma,
    })
  }

  homonymChanged = (homonym) => {
    this.props.onChange({
      ...this.props.value,
      homonym: homonym,
    })
  }

  notesChanged = (notes) => {
    this.props.onChange({
      ...this.props.value,
      notes: notes,
    })
  }

  hasProperty = (property) => _.has(this.props.value, property)

  render() {
    return (
      <FormGroup>
        <LemmaInput value={this.props.value} onChange={this.lemmaChanged} />
        {this.hasProperty('homonym') && (
          <TextInput
            value={this.props.value.homonym}
            onChange={this.homonymChanged}
          >
            Homonym
          </TextInput>
        )}
        {this.hasProperty('notes') && (
          <ListInput
            value={this.props.value.notes}
            onChange={this.notesChanged}
          >
            Notes
          </ListInput>
        )}
      </FormGroup>
    )
  }
}

export default FormInput
