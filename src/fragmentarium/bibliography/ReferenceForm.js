import React, { Component } from 'react'
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap'
import _ from 'lodash'

import ArrayInput from 'common/ArrayInput'

export default class ReferenceForm extends Component {
  constructor (props) {
    super(props)
    this.id = _.uniqueId('ReferenceForm-')
  }

  render () {
    return (
      <form>
        <FormGroup controlId={`${this.id}-ID`}>
          <ControlLabel>ID</ControlLabel>
          <FormControl
            type='text'
            defaultValue={this.props.value.id} />
        </FormGroup>
        <FormGroup controlId={`${this.id}-Pages`}>
          <ControlLabel>Pages</ControlLabel>
          <FormControl
            type='text'
            defaultValue={this.props.value.pages} />
        </FormGroup>
        <FormGroup controlId={`${this.id}-Type`}>
          <ControlLabel>Type</ControlLabel>
          <FormControl componentClass='select' defaultValue={this.props.value.type}>
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
            defaultValue={this.props.value.notes} />
        </FormGroup>
        <ArrayInput
          separator=','
          value={this.props.value.linesCited}
          onChange={_.noop}>
          Lines Cited
        </ArrayInput>
      </form>
    )
  }
}
