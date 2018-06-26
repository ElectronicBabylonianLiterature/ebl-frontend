import React, { Component } from 'react'
import { FormGroup } from 'react-bootstrap'
import _ from 'lodash'

import LemmaInput from './LemmaInput'
import ListInput from './ListInput'
import TextInput from './TextInput'

class FormInput extends Component {
  lemmaChanged = lemma => {
    this.props.onChange({
      ...this.props.value,
      ...lemma
    })
  }

  homonymChanged = homonym => {
    this.props.onChange({
      ...this.props.value,
      homonym: homonym
    })
  }

  notesChanged = notes => {
    this.props.onChange({
      ...this.props.value,
      notes: notes
    })
  }

  hasProperty = property => _.has(this.props.value, property)
  
  render () {
    return (
      <FormGroup>
        <LemmaInput id={`${this.props.id}-lemma`} value={this.props.value} onChange={this.lemmaChanged} />
        {this.hasProperty('homonym') && (
          <TextInput
            id={`${this.props.id}-homonym`}
            value={this.props.value.homonym}
            onChange={this.homonymChanged}>
            Homonym
          </TextInput>
        )}
        {this.hasProperty('notes') && (
          <ListInput id={`${this.props.id}-notes`} value={this.props.value.notes} onChange={this.notesChanged}>
            Notes
          </ListInput>
        )}
      </FormGroup>
    )
  }
}

export default FormInput
