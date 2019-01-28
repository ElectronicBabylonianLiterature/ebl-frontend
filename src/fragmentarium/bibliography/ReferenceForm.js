import React, { Component } from 'react'
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap'
import _ from 'lodash'

import ArrayInput from 'common/ArrayInput'

export default class ReferenceForm extends Component {
  constructor (props) {
    super(props)
    this.id = _.uniqueId('ReferenceForm-')
  }

  handleChange = property => value => this.props.onChange({
    ...this.props.value,
    [property]: value
  })

  handleEvent = property => ({ target }) => this.handleChange(property)(target.value)

  render () {
    return (<>
      <FormGroup controlId={`${this.id}-ID`}>
        <ControlLabel>ID</ControlLabel>
        <FormControl
          type='text'
          value={this.props.value.id}
          onChange={this.handleEvent('id')}
          required />
      </FormGroup>
      <FormGroup controlId={`${this.id}-Pages`}>
        <ControlLabel>Pages</ControlLabel>
        <FormControl
          type='text'
          value={this.props.value.pages}
          onChange={this.handleEvent('pages')} />
      </FormGroup>
      <FormGroup controlId={`${this.id}-Type`}>
        <ControlLabel>Type</ControlLabel>
        <FormControl
          componentClass='select'
          value={this.props.value.type}
          onChange={this.handleEvent('type')}
          required >
          <option value='EDITION'>Edition</option>
          <option value='DISCUSSION'>Discussion</option>
          <option value='COPY'>Copy</option>
          <option value='PHOTO'>Photo</option>
        </FormControl>
      </FormGroup>
      <FormGroup controlId={`${this.id}-Notes`}>
        <ControlLabel>Notes</ControlLabel>
        <FormControl
          type='text'
          defaultValue={this.props.value.notes}
          onChange={this.handleEvent('notes')} />
      </FormGroup>
      <ArrayInput
        separator=','
        value={this.props.value.linesCited}
        onChange={this.handleChange('linesCited')}>
        Lines Cited
      </ArrayInput>
    </>)
  }
}
