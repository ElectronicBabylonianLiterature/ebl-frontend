import React, { Component } from 'react'
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap'
import _ from 'lodash'

import LemmaInput from './LemmaInput'
import ListInput from './ListInput'

class FormInput extends Component {
  lemmaChanged = lemma => {
    this.props.onChange({
      ...this.props.value,
      ...lemma
    })
  }

  homonymChanged = event => {
    this.props.onChange({
      ...this.props.value,
      homonym: event.target.value
    })
  }

  notesChanged = notes => {
    this.props.onChange({
      ...this.props.value,
      notes: notes
    })
  }

  render () {
    return (
      <FormGroup>
        <LemmaInput id={`${this.props.id}-lemma`} value={this.props.value} onChange={this.lemmaChanged} />
        {_.has(this.props.value, 'homonym') && (
          <FormGroup controlId={`${this.props.id}-homonym`}>
            <ControlLabel>Homonym</ControlLabel>
            <FormControl
              type='text'
              value={this.props.value.homonym}
              onChange={this.homonymChanged} />
          </FormGroup>
        )}
        {_.has(this.props.value, 'notes') && (
          <ListInput id={`${this.props.id}-notes`} value={this.props.value.notes} onChange={this.notesChanged}>
            Notes
          </ListInput>
        )}
      </FormGroup>
    )
  }
}

export default FormInput
